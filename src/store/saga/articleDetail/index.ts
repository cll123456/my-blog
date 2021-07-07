import { takeEvery, put, select, call } from "@redux-saga/core/effects"
import marked from "marked";
import { apiGetArticleDetailById, apiSetArticleReadOrLike } from "../../../api/articleDetail";
import { ILinkObj } from "../../../types/layout/articleDetail";
import { IStore } from "../../../types/store/action";
import { IArticleDetailReadOrLike, IArticleDetailRes } from "../../../types/store/action/articleDetail";
import { formateStr } from "../../../utils/stringUtil";
import { getArticleDetailData, setArticleDetailData, setArticleDetailDialog, setArticleDetailLoading, setArticleLikeNum } from "../../actions/articleDetail"

export default function* () {
  yield takeEvery(getArticleDetailData, getArticleDetailDataEffects);
  yield takeEvery(setArticleLikeNum, setLike);
}

/**
 * 对markdown 进行ast分析
 * @param arr 
 * @returns 
 */
function astDialog(arr: marked.TokensList) {
  let res: ILinkObj[] = [];
  // 第一层for循环，活力type为heading的类型
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].type === 'heading') {
      let text = formateStr((arr[i] as any).text)
      // 收集依赖
      res.push({ level: `h${(arr[i] as any).depth}`, idName: text })
    }
  }


  return res;
}

// 获取文章详情副作用
function* getArticleDetailDataEffects() {
  yield put(setArticleDetailLoading(true));
  // 获取仓库
  const store: IStore = yield select();
  try {
    const res: IArticleDetailRes = yield call(apiGetArticleDetailById, store.articleDetail.currentArticleId)
    yield put(setArticleDetailData(res.data))
    // 语法分析
    const astRes = astDialog(marked.lexer(res.data.details.content));
    yield put(setArticleDetailDialog(astRes))
    yield articleCreateReadOrLike({ articleId: store.articleDetail.currentArticleId, readNum: true, likeNum: false });
  } catch (error) {
    throw Error('文章详情获取数据失败' + error.message)
  } finally {
    yield put(setArticleDetailLoading(false));
  }
}

/**
 * 点赞
 */
function* setLike() {
  // 获取仓库
  const store: IStore = yield select();
  yield articleCreateReadOrLike({ articleId: store.articleDetail.currentArticleId, readNum: false, likeNum: true })
}

/**
 * 文字的点赞或者阅读
 */
function* articleCreateReadOrLike(params: IArticleDetailReadOrLike) {
  yield call(apiSetArticleReadOrLike, params)
}