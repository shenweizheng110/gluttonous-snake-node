import GS from 'GS';
import Snake from 'Snake';
import Game from 'Game';
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
        GAME_OVER = 'gameOver'
    }

    type Send = (ws: Ws, type: ApiResType, payload: GS.GameResult) => void;

    type HandleEnterRoom = (payload: { roomId: string; userId: string; userConfig: Snake.UserConfig; userInfo: Game.UserInfo }) => void;

    type HandlePrepare = (payload: { roomId: string; userId: string }) => void;

    type HandleStart = (paylaod: { roomId: string }) => void;

    type GetRoomUsers = (payload: { roomId: string }) => void;

    type InitPvpUser = (payload: { roomId: string; userId: string; canvasWidth: number; canvasHeight: number }) => void;

    type HandleMove = (payload: Snake.ShowPayload) => void;

    type Show = (roomId: string) => void;
}

export default GameAPI;
