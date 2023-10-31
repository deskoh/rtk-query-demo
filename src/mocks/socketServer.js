import { nanoid } from '@reduxjs/toolkit';
import { Server as MockSocketServer } from 'mock-socket'

const socketServer = new MockSocketServer('ws://localhost')
let currentSocket;


const publishMessage = (socket, topic, payload) => {
  socket.send(JSON.stringify({ topic, payload }));
}

let counter = 1;
export const publishMessageToClient = ({ type, event, payload }) => {
  switch (event) {
    case 'create':
      publishMessage(
        currentSocket, `${type}/${event}`, { id: nanoid(), name: `new ${++counter}` },
      );
      break;
    case 'update':
      publishMessage(
        currentSocket, `${type}/${event}`, { id: payload.id, name: payload.name },
      );
      break;
    case 'delete':
        publishMessage(
          currentSocket, `${type}/${event}`, { id: payload.id },
        );
        break;
    default:
      break
  }
}

// let counter = 0;
socketServer.on('connection', (socket) => {
  currentSocket = socket
  // socket.on('message', (data) => {
  //   const { type, event, payload } = JSON.parse(data)

  //   switch (event) {
  //     case 'create': {
  //       publishMessage(
  //         socket,
  //         `${type}/{event}`,
  //         { name: `new ${++counter}` },
  //       );
  //       break
  //     }
  //     default:
  //       publishMessage(socket, `${type}/{event}`, payload);
  //       break
  //   }
  // })
})
