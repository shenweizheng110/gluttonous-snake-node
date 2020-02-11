import GS from 'GS';

declare namespace Rank {
    interface RankItem {
        username: string;
        headImg: string;
        favour: number;
        favourRecordId: number;
        userId: string;
        value: number;
    }

    /* interface ScoreRankItem extends RankItem {
        maxScore: number;
    }

    interface RecordCountRankItem extends RankItem {
        recordCount: number;
    }

    interface DefeatCountRankItem extends RankItem {
        defeatCount: number;
    }

    interface MaxDefeatRankItem extends RankItem {
        maxDefeat: number;
    } */

    interface SearchInfo extends GS.PageInfoParams {
        userId: string;
    }

    interface RankRes<T> {
        rankList: T[];
        rankIndex: number;
    }

    type GetRank<T> = (searchInfo: SearchInfo) => Promise<GS.DoneReturn<RankRes<T>> | GS.FailRetuen<string, null>>

    type RankListItem = RankItem;

    type GetRankIndex = (rankList: RankItem[], userId: string) => number;
}

export default Rank;
