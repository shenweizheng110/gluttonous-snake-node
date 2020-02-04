// import Snake from 'Snake';

declare namespace Bean {

    interface BeanItem {
        x: number;
        y: number;
        val: number;
        color: string;
    }

    interface BeanStore {
        [roomId: string]: {
            [id: string]: BeanItem;
        };
    }

    type IntBean = (x: number, y: number, val: number) => BeanItem;

    type Destory = (roomId: string, canvasWidth: number, canvasHeight: number, beanItem: BeanItem) => void;

    type GenerateBean = (roomId: string, canvasWidth: number, canvasHeight: number) => void;

    type GetAllBeans = (roomId: string) => {
        [id: string]: BeanItem;
    };
}

export default Bean;
