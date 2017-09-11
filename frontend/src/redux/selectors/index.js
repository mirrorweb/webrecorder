import { createSelector } from 'reselect';

import { rts, truncate } from 'helpers/utils';


const getCollections = state => state.get('collections');
const getActiveRemoteBrowserId = state => state.getIn(['remoteBrowsers', 'activeBrowser']) || null;
const getBookmarks = state => state.getIn(['collection', 'bookmarks']);
const getRemoteBrowsers = state => state.getIn(['remoteBrowsers', 'browsers']);
const getTimestamp = (state, props) => props.params.ts;
const getUserCollections = state => state.getIn(['user', 'collections']);
const getUrl = (state, props) => props.params.splat;
const selectedCollection = state => state.getIn(['user', 'activeCollection']);
const userOrderBy = state => state.get('userOrderBy') || 'timestamp';


export const getActiveCollection = createSelector(
  [getUserCollections, selectedCollection],
  (collections, activeCollection) => {
    if(!activeCollection)
      return { title: null, id: null };

    const selected = collections.find(coll => coll.get('id') === activeCollection);
    const title = selected.get('title');
    const id = selected.get('id');
    return { title: truncate(title, 40), id };
  }
);

export const getActiveRemoteBrowser = createSelector(
  [getActiveRemoteBrowserId, getRemoteBrowsers],
  (activeBrowserId, browsers) => {
    return activeBrowserId ? browsers.get(activeBrowserId) : null;
  }
);

export const getBookmarkCount = createSelector(
  [getBookmarks],
  (bookmarks) => {
    return bookmarks.flatten(true).size;
  }
);

export const getOrderedBookmarks = createSelector(
  [getBookmarks, userOrderBy],
  (bookmarks, order) => {
    return bookmarks.flatten(true).sortBy(o => o.get(order));
  }
);

export const getActiveRecording = createSelector(
  [getOrderedBookmarks, getTimestamp, getUrl],
  (bookmarks, ts, url) => {
    if (!ts) {
      const idx = bookmarks.findIndex((b) => { return b.get('url') === url || rts(b.get('url')) === rts(url); });
      return idx === -1 ? 0 : idx;
    }

    const item = { url, ts: parseInt(ts, 10) };
    let minIdx = 0;
    let maxIdx = bookmarks.size - 1;
    let curIdx;
    let curUrl;
    let curEle;

    while (minIdx <= maxIdx) {
      curIdx = ((minIdx + maxIdx) / 2) | 0;
      curUrl = bookmarks.get(curIdx).get('url');
      curEle = parseInt(bookmarks.get(curIdx).get('timestamp'), 10);

      if (curEle < item.ts) {
        minIdx = curIdx + 1;
      } else if (curEle > item.ts) {
        maxIdx = curIdx - 1;
      } else if (curEle === item.ts && (item.url !== curUrl && rts(item.url) !== rts(curUrl))) {
        /**
         * If multiple recordings are within a timestamp, or if the url
         * for the timestamp doesn't match exactly, iterate over other
         * options. If no exact match is found, resolve to first ts match.
         */
        let tempUrl;
        const origIdx = curIdx;
        while (curEle === item.ts && curIdx < bookmarks.size - 1) {
          tempUrl = bookmarks.get(++curIdx).get('url');
          curEle = parseInt(bookmarks.get(curIdx).get('ts'), 10);
          if (tempUrl === item.url) {
            return curIdx;
          }
        }
        return origIdx;
      } else {
        return curIdx;
      }
    }

    return 0;
  }
);

export const sumCollectionsSize = createSelector(
  [getCollections],
  (collections) => {
    return collections.reduce((sum, coll) => parseInt(coll.get('size'), 10) + sum, 0);
  }
);
