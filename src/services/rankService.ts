import dao from '../dao';
import Rank from 'Rank';
import { done } from '../common/util';

const getRankIndex: Rank.GetRankIndex = (rankList, userId) => {
    let rankIndex: number = null;
    rankList.some((item: Rank.RankListItem, index: number) => {
        if (item.userId == userId) {
            rankIndex = index;
        }
    });
    return rankIndex;
};

/**
 * 获取分数排行榜
 * @param pageStart 页码
 * @param pageSize 页大小
 */
export const getScoreRank: Rank.GetRank<Rank.RankItem> = async searchInfo => {
    let rankList: Rank.RankItem[] = await dao.query('rank.getScoreRank', searchInfo);
    return done<Rank.RankRes<Rank.RankItem>>({
        rankList,
        rankIndex: getRankIndex(rankList, searchInfo.userId)
    });
};

/**
 * 获取总局数排行榜
 * @param pageStart 页码
 * @param pageSize 页大小
 */
export const getRecordCountRank: Rank.GetRank<Rank.RankItem> = async searchInfo => {
    let rankList: Rank.RankItem[] = await dao.query('rank.getRecordCountRank', searchInfo);
    return done<Rank.RankRes<Rank.RankItem>>({
        rankList,
        rankIndex: getRankIndex(rankList, searchInfo.userId)
    });
};

/**
 * 获取总击杀数排行榜
 * @param pageStart 页码
 * @param pageSize 页大小
 */
export const getDefeatCountRank: Rank.GetRank<Rank.RankItem> = async searchInfo => {
    let rankList: Rank.RankItem[] = await dao.query('rank.getDefeatCountRank', searchInfo);
    return done<Rank.RankRes<Rank.RankItem>>({
        rankList,
        rankIndex: getRankIndex(rankList, searchInfo.userId)
    });
};

/**
 * 获取最多击杀排行榜
 * @param pageStart 页码
 * @param pageSize 页大小
 */
export const getMaxDefeatRank: Rank.GetRank<Rank.RankItem> = async searchInfo => {
    let rankList: Rank.RankItem[] = await dao.query('rank.getMaxDefeatRank', searchInfo);
    return done<Rank.RankRes<Rank.RankItem>>({
        rankList,
        rankIndex: getRankIndex(rankList, searchInfo.userId)
    });
};
