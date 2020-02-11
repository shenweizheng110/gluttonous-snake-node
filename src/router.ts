import GS from 'GS';
import * as Ws from 'ws';
import roomCtrl from './ctrls/roomCtrl';
import userCtrl from './ctrls/userCtrl';
import gameCtrl from './ctrls/gameCtrl';
import pvpCtrl from './ctrls/pvpCtrl';
import settingsCtrl from './ctrls/settingsCtrl';
import rankCtrl from './ctrls/rankCtrl';
import commonCtrl from './ctrls/commonCtrl';
import { addClient, removeClient } from './game/clientStore';

const registerRouter: GS.RegisterRouterFnc = (wsInstance) => {
    const { app } = wsInstance;
    app.ws('/api/game', (ws: Ws) => {
        addClient(ws);
        ws.onclose = () => {
            removeClient(ws);
        };
        gameCtrl(ws);
    });
    app.ws('/api/pvp', (ws: Ws) => {
        addClient(ws);
        ws.onclose = () => {
            removeClient(ws);
        };
        pvpCtrl(ws);
    });
    app.use('/api/room', roomCtrl);
    app.use('/api/user', userCtrl);
    app.use('/api/settings', settingsCtrl);
    app.use('/api/rank', rankCtrl);
    app.use('/api/common', commonCtrl);
};

export default registerRouter;
