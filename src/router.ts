import GS from 'GS';
import * as Ws from 'ws';
import roomCtrl from './ctrls/roomCtrl';
import userCtrl from './ctrls/userCtrl';
import gameCtrl from './ctrls/gameCtrl';
import pvpCtrl from './ctrls/pvpCtrl';
import settingsCtrl from './ctrls/settingsCtrl';

const registerRouter: GS.RegisterRouterFnc = ({ app }) => {
    app.ws('/api/game', (ws: Ws) => {
        gameCtrl(ws);
    });
    app.ws('/api/pvp', (ws: Ws) => {
        pvpCtrl(ws);
    });
    app.use('/api/room', roomCtrl);
    app.use('/api/user', userCtrl);
    app.use('/api/settings', settingsCtrl);
};

export default registerRouter;
