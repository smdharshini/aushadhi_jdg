import { trainLocalStateModel } from '../math/federated';
import { StateId } from '../types';

export interface WorkerInitMessage {
  type: 'INIT_STATE';
  stateId: StateId;
  X: number[][];
  y: number[];
}

export interface WorkerTrainMessage {
  type: 'TRAIN_ROUND';
  round: number;
  weights: number[];
  bias: number;
  epochs?: number;
  learningRate?: number;
}

export type WorkerInMessage = WorkerInitMessage | WorkerTrainMessage;

export interface WorkerOutMessage {
  type: 'ROUND_COMPLETE' | 'INITIALIZED';
  stateId: StateId;
  sampleCount: number;
  weights: number[];
  bias: number;
  localLoss: number;
}

let localStateId: StateId | null = null;
let localX: number[][] = [];
let localY: number[] = [];

self.onmessage = (event: MessageEvent<WorkerInMessage>) => {
  const msg = event.data;

  if (msg.type === 'INIT_STATE') {
    localStateId = msg.stateId;
    localX = msg.X;
    localY = msg.y;
    self.postMessage({
      type: 'INITIALIZED',
      stateId: localStateId,
      sampleCount: localX.length,
      weights: [],
      bias: 0,
      localLoss: 0,
    } as WorkerOutMessage);
    return;
  }

  if (msg.type === 'TRAIN_ROUND' && localStateId) {
    const epochs = msg.epochs || 5;
    const lr = msg.learningRate || 0.005;

    const result = trainLocalStateModel(
      localX,
      localY,
      msg.weights,
      msg.bias,
      epochs,
      lr
    );

    self.postMessage({
      type: 'ROUND_COMPLETE',
      stateId: localStateId,
      sampleCount: localX.length,
      weights: result.weights,
      bias: result.bias,
      localLoss: result.loss,
    } as WorkerOutMessage);
  }
};
