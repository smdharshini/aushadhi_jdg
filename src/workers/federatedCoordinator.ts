import {
  computeMape,
  computeMseLoss,
  computeSampleWeightedFedAvg,
  LocalTrainingResult,
  trainLocalStateModel,
} from '../math/federated';
import { FederatedModelWeights, FederatedRoundResult, StateId } from '../types';

export interface StateDataset {
  stateId: StateId;
  trainX: number[][];
  trainY: number[];
  testX: number[][];
  testY: number[];
}

export class FederatedCoordinator {
  private workers: Map<StateId, Worker> = new Map();
  private stateDatasets: Map<StateId, StateDataset> = new Map();
  private currentWeights: FederatedModelWeights = {
    weights: [0.35, 0.25, 0.2, 0.1, -0.05, 0.05, 0.02, 0.4],
    bias: 50,
  };
  private localOnlyWeights: Map<StateId, FederatedModelWeights> = new Map();
  private currentRound = 0;
  private hasWorkers = typeof window !== 'undefined' && typeof window.Worker !== 'undefined';

  constructor(datasets: StateDataset[]) {
    for (const ds of datasets) {
      this.stateDatasets.set(ds.stateId, ds);
      // Initialize local-only model clone
      this.localOnlyWeights.set(ds.stateId, {
        weights: [...this.currentWeights.weights],
        bias: this.currentWeights.bias,
      });

      if (this.hasWorkers) {
        try {
          const worker = new Worker(
            new URL('./stateWorker.ts', import.meta.url),
            { type: 'module' }
          );
          worker.postMessage({
            type: 'INIT_STATE',
            stateId: ds.stateId,
            X: ds.trainX,
            y: ds.trainY,
          });
          this.workers.set(ds.stateId, worker);
        } catch {
          this.hasWorkers = false;
        }
      }
    }
  }

  public getCurrentWeights(): FederatedModelWeights {
    return { ...this.currentWeights };
  }

  public getCurrentRound(): number {
    return this.currentRound;
  }

  public async runRound(): Promise<FederatedRoundResult> {
    this.currentRound++;
    const stateResults: LocalTrainingResult[] = [];

    // Run local training on all 4 states
    for (const [stateId, ds] of this.stateDatasets.entries()) {
      if (this.hasWorkers && this.workers.has(stateId)) {
        // Use Web Worker with message promise
        const worker = this.workers.get(stateId)!;
        const res = await new Promise<LocalTrainingResult>((resolve) => {
          const handler = (e: MessageEvent) => {
            if (e.data.type === 'ROUND_COMPLETE') {
              worker.removeEventListener('message', handler);
              resolve({
                stateId: e.data.stateId,
                sampleCount: e.data.sampleCount,
                weights: e.data.weights,
                bias: e.data.bias,
                localLoss: e.data.localLoss,
              });
            }
          };
          worker.addEventListener('message', handler);
          worker.postMessage({
            type: 'TRAIN_ROUND',
            round: this.currentRound,
            weights: this.currentWeights.weights,
            bias: this.currentWeights.bias,
            epochs: 5,
            learningRate: 0.005,
          });
        });
        stateResults.push(res);
      } else {
        // Direct local training fallback within isolated function
        const trained = trainLocalStateModel(
          ds.trainX,
          ds.trainY,
          this.currentWeights.weights,
          this.currentWeights.bias,
          5,
          0.005,
          0.01
        );
        stateResults.push({
          stateId,
          sampleCount: ds.trainX.length,
          weights: trained.weights,
          bias: trained.bias,
          localLoss: trained.loss,
        });
      }

      // Also update local-only model (no sharing) to benchmark against
      const curLocal = this.localOnlyWeights.get(stateId)!;
      const trainedLocal = trainLocalStateModel(
        ds.trainX,
        ds.trainY,
        curLocal.weights,
        curLocal.bias,
        5,
        0.005,
        0.01
      );
      this.localOnlyWeights.set(stateId, {
        weights: trainedLocal.weights,
        bias: trainedLocal.bias,
      });
    }

    // FedAvg Aggregation on the coordinator (receives only weights, no raw data)
    this.currentWeights = computeSampleWeightedFedAvg(stateResults);

    // Compute metrics across held-out validation test sets
    let allTestX: number[][] = [];
    let allTestY: number[] = [];
    const stateLosses: Record<StateId, number> = {} as Record<StateId, number>;
    const stateSamples: Record<StateId, number> = {} as Record<StateId, number>;

    let totalLocalOnlyMapeSum = 0;

    for (const [stateId, ds] of this.stateDatasets.entries()) {
      allTestX = allTestX.concat(ds.testX);
      allTestY = allTestY.concat(ds.testY);

      const localLoss = computeMseLoss(ds.testX, ds.testY, this.currentWeights);
      stateLosses[stateId] = localLoss;
      stateSamples[stateId] = ds.trainX.length;

      // Local-only model evaluation on test set
      const localWeights = this.localOnlyWeights.get(stateId)!;
      totalLocalOnlyMapeSum += computeMape(ds.testX, ds.testY, localWeights);
    }

    const globalLoss = computeMseLoss(allTestX, allTestY, this.currentWeights);
    const globalMape = computeMape(allTestX, allTestY, this.currentWeights);
    const localOnlyMape = Number(
      (totalLocalOnlyMapeSum / this.stateDatasets.size).toFixed(2)
    );

    return {
      round: this.currentRound,
      globalLoss,
      globalMape,
      localOnlyMape,
      stateLosses,
      stateSamples,
      timestamp: new Date().toISOString(),
    };
  }

  public terminate(): void {
    for (const w of this.workers.values()) {
      w.terminate();
    }
    this.workers.clear();
  }
}
