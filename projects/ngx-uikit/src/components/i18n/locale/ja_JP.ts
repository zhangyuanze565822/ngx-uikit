import Calendar from './calendar/ja_JP';
import DatePicker from './date-picker/ja_JP';
import Pagination from './pagination/ja_JP';
import TimePicker from './time-picker/ja_JP';

export default {
  locale: 'ja',
  Pagination,
  DatePicker,
  TimePicker,
  Calendar,
  Table: {
    filterTitle: 'メニューをフィルター',
    filterConfirm: 'OK',
    filterReset: 'リセット',
    selectAll: 'すべてを選択',
    selectInvert: '選択を反転',
  },
  Modal: {
    okText: 'OK',
    cancelText: 'キャンセル',
    justOkText: 'OK',
  },
  Confirm: {
    okText: 'OK',
    cancelText: 'キャンセル',
  },
  Transfer: {
    searchPlaceholder: 'ここを検索',
    itemUnit: 'アイテム',
    itemsUnit: 'アイテム',
  },
  Upload: {
    uploading: 'アップロード中...',
    removeFile: 'ファイルを削除',
    uploadError: 'アップロードエラー',
    previewFile: 'ファイルをプレビュー',
  },
  Empty: {
    description: 'データがありません',
  },
};
