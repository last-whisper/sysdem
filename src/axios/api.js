export default {
  USER_LLOGIN:'v1/admin/users/login',//登陆 post
  MESSAGE_LIST:'v1/admin/suggests',//反馈信息列表
  REPLY_MESSAGE:'v1/admin/suggests/',//回复反馈信息
  PUBLIC_CHAIN:'v1/admin/coins',//公链列表
  PUBLIC_CHAIN_UPDATE:'v1/admin/coins/',//put=公链币种更新数据
  TOKENS:'v1/admin/tokens/search',//搜索代币
  TOKEN_UPDATE:'v1/admin/tokens',//put=更新代币
  TOKEN_RECOMMENDED:'v1/admin/tokens/recommend',//get=获取被推荐的代币
  IMPORT_CSV:'v1/admin/tokens/upload',//导入csv文件
  BELONG_TO:'v1/admin/coins/belongTo',//获取公链币种信息
  OSS_SIGN:'v1/admin/oss/sign',//客户端0ss直传签名
  GET_TOKEN_INFO:'v1/admin/tokens/getTokeninfo',//获取以太币Token信息
  CSV_UPLOAD:'v1/admin/tokens/upload',//上传CSV
  NOTICE_LIST:'v1/admin/notices',//get=推送消息列表,post=新增推送消息
  NOTICE_UPDATE:'v1/admin/notices/',//put=更新系统通知，delete=删除推送通知
  VERSION_LIST:'v1/admin/versions',//历史版本列表get{pageSize,page}=获取，post=添加，get/id=获取指定版本信息delete/id=删除put/id=更新
}
