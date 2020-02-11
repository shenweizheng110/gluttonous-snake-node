import GS from 'GS';
import Snake from 'Snake';
import * as Ws from 'ws';

declare namespace GameAPI {
    const enum ApiResType {
        ERROR = 'error',
        SUCCESS = 'success',
        START = 'start',
        OVER = 'over',
        ENTER_ROOM = 'enterRoom',
        ROOM_GAME = 'roomGame',
        PREPARE = 'prepare',
        ALL = 'all',
        SHOW = 'show',
        GAME_OVER = 'gameOver',
        GO_HOME = 'goHome'
    }

    type Send = (ws: Ws, type: ApiResType, payload: GS.GameResult) => void;

    type HandleEnterRoom = (ws: Ws, payload: { roomId: string; userId: string }) => void;

    type HandlePrepare = (ws: Ws, payload: { roomId: string; userId: string }) => void;

    type HandleStart = (ws: Ws, paylaod: { roomId: string }) => void;

    type GetRoomUsers = (payload: { roomId: string }) => void;

    type InitPvpUser = (ws: Ws, payload: { roomId: string; userId: string; canvasWidth: number; canvasHeight: number }) => void;

    type HandleMove = (ws: Ws, roomId: string) => void;

    type Show = (ws: Ws, roomId: string) => void;

    type HandleLeaveHome = (ws: Ws, payload: { roomId: string; userId: string }) => void;

    interface GameClient {
        [roomId: string]: {
            [userId: string]: Ws;
        };
    }

    type AddPartClient = (clientType: string, roomId: string, userId: string, ws: Ws) => void;

    type RemovePartClient = (clientType: string, roomId: string, userId?: string) => void;

    type PartClientBroadcast = (clientType: string, roomId: string, type: ApiResType, data: any) => void;

    type AddClient = (ws: Ws) => void;

    type RemoveClient = (ws: Ws) => void;

    type ValidWsIsOpen = (ws: Ws) => boolean;
}

export default GameAPI;
