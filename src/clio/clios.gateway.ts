import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection
    //@ts-ignore
} from '@nestjs/websockets';

import { Socket, Server } from 'socket.io';

@WebSocketGateway({ namespace: 'clio', cors: true })
export class ClioGateway implements OnGatewayConnection {
    @WebSocketServer() server: Server;

    handleConnection(client: Socket, ...args: any[]) {
    }

    @SubscribeMessage('subscribeToProfile')
    handleSubscribeToProfile(client: Socket, _id: string) {
        client.join(_id)
    }

    expiredTimestampUpdateNotify(_id: Object, expiredTimestamp: number) {
        this.server.to(_id.toString()).emit('expiredTimestampUpdated', expiredTimestamp);
    }
}