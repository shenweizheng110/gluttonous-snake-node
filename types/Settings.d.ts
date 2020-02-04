import GS from 'GS';

declare namespace Settings {
    type GetSettingsByUserId = (userId: string) => Promise<GS.DoneReturn<UserConfig> | GS.FailRetuen<string, null>>;

    type UpdateUserConfig = (userId: string, userConfig: ConfigParams) => Promise<GS.DoneReturn<any> | GS.FailRetuen<string, null>>;

    type InitUserConfig = (userId: string) => Promise<GS.DoneReturn<number> | GS.FailRetuen<string, null>>;

    interface ConfigParams {
        up?: number;
        down?: number;
        left?: number;
        right?: number;
        start?: number;
        pause?: number;
        exit?: number;
        speedUp?: number;
        showFight?: number;
        showPersonal?: number;
        initSpeed?: number;
        dangerColor?: string;
        nodeColor?: string;
        eyeColor?: string;
    }

    interface UserConfig {
        id: number;
        userId: number;
        up: number;
        down: number;
        left: number;
        right: number;
        start: number;
        pause: number;
        exit: number;
        speedUp: number;
        showFight: number;
        showPersonal: number;
        initSpeed: number;
        dangerColor: string;
        nodeColor: string;
        eyeColor: string;
        createTime: Date;
        updateTime: Date;
    }

    type GetSettingsRes = UserConfig[]
}

export default Settings;
