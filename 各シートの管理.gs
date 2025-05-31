FOLDER_ID = "1CHHcNn7GDM5YJWOLyojddgVijxMmvUNG"　//各々の体重を管理するフォルダー

//新しい月のための表を作成する
function makeNewMonth(sheet=SpreadsheetApp.getActiveSheet()){ 
  sheet.insertRowsBefore(1,5) //4行挿入
  let this_month = getToday() //今月の情報
  console.log(this_month)
  sheet.getRange("A1").setValue(this_month.year+"年"+this_month.month+"月") //月
  sheet.getRange("A2").setValue("体重(kg)") //体重
  sheet.getRange("A3").setValue("体脂肪率(%)") //体脂肪率
  sheet.getRange("A4").setValue("筋肉量(kg)") //筋肉量
  for(let i=1;i<=this_month.days;i++){
    sheet.getRange(1,i+1).setValue(i) //日にちをセット
  }
  sheet.getRange(1,1,4,this_month.days+1).setBorder(true,true,true,true,true,true) //罫線をセット
}

//西暦、月、日数を生成。
function getToday(year=undefined,month=undefined){
  let today = new Date()
  if(year != undefined && month != undefined){
    today = new Date(year,month-1) //指定した月の情報
  }
  let this_year = today.getFullYear() //西暦
  let this_month = today.getMonth()+1 //月
  let this_day = today.getDate() //日
  let this_youbi = today.getDay() //曜日
  let this_days = new Date(this_year,this_month,0).getDate() //日付
  return {year:this_year,month:this_month,days:this_days,day:this_day,youbi:this_youbi}
}

//体重と脂肪率、筋肉量を記録する
function putInfomation(weight,fat,muscle,date,spread_sheet){ //spread_sheetはファイルの形式
  //一番上の月を取得して、指定された月と違う場合は新しく欄を生成する。そうでない場合はそのまま書き込む
  let year = date.getFullYear() //年
  let month = date.getMonth()+1 //月
  let day = date.getDate() //日
  //記録用のスプレッドシートに
  //spread_sheet = SpreadsheetApp.getActiveSpreadsheet()
  spread_sheet = SpreadsheetApp.openById(spread_sheet.getId()) //スプレッドシートに置き換える
  let sheet = spread_sheet.getSheetByName("記録用")
  let first = new Date(sheet.getRange("A1").getValue())
  let this_month = first.getMonth()+1
  let date_format = year + "/" + month + "/" + day
  if(month == this_month){ //今月の記録の場合
    sheet.getRange(2,day+1).setValue(weight)
    sheet.getRange(3,day+1).setValue(fat)
    sheet.getRange(4,day+1).setValue(muscle)
  }
  else if(month > this_month){ //月が変わって初めてのパターン
    makeNewMonth(sheet)
    sheet.getRange(2,day+1).setValue(weight)
    sheet.getRange(3,day+1).setValue(fat)
    sheet.getRange(4,day+1).setValue(muscle)
  }
  else{ //先月の記録を記入する場合
    sheet.getRange(7,day+1).setValue(weight)
    sheet.getRange(8,day+1).setValue(fat)
    sheet.getRange(9,day+1).setValue(muscle)
  }
  //グラフ用のスプレッドシートに
  let sheet_graph = spread_sheet.getSheetByName("グラフ用")
  let insert_place = decidePlace(sheet_graph,date)
  let before_date = new Date(sheet_graph.getRange(1,insert_place+1).getValue())
  if(before_date.getTime() != date.getTime()){ //かぶっていなかったら新しく挿入
    sheet_graph.insertColumnAfter(insert_place)
  }
  sheet_graph.getRange(1,insert_place+1).setValue(year+"/"+month+"/"+day)
  sheet_graph.getRange(2,insert_place+1).setValue(weight)
  sheet_graph.getRange(3,insert_place+1).setValue(fat)
  sheet_graph.getRange(4,insert_place+1).setValue(muscle)
  generateChart(sheet_graph)
}

//グラフ用
function decidePlace(sheet_graph,date){
  let last_column = sheet_graph.getLastColumn() //最終列
  let result = 1
  for(let i=last_column;i>=1;i--){
    let compare_date = new Date(sheet_graph.getRange(1,i).getValue())
    if(compare_date < date){
      result = i
      break
    }
  }
  return result
}

//新しい人のファイルを生成する
function generateSpreadsheet(file_name="ガムボール・ワタソン"){
  //ファイル生成→フォルダーを移動
  let new_SS = SpreadsheetApp.create(file_name)
  let new_SS_as_file = DriveApp.getFileById(new_SS.getId())
  DriveApp.getFolderById(FOLDER_ID).addFile(new_SS_as_file)
  DriveApp.getRootFolder().removeFile(new_SS_as_file)
  //共有の設定(最初から共有を全体にする)
  let access = DriveApp.Access.ANYONE_WITH_LINK
  let permission = DriveApp.Permission.EDIT
  new_SS_as_file.setSharing(access,permission)
  //シートの作成(記録用とグラフ用の2種類)
  new_SS.insertSheet() //1枚追加
  let sheets = new_SS.getSheets()
  sheets[0].setName("記録用")
  makeNewMonth(sheets[0])
  sheets[1].setName("グラフ用")
  sheets[1].getRange(1,1).setValue("グラフ用の記録")
  sheets[1].getRange(2,1).setValue("体重(kg)")
  sheets[1].getRange(3,1).setValue("体脂肪率(%)")
  sheets[1].getRange(4,1).setValue("筋肉量(kg)")
  return new_SS_as_file
}

//グラフの生成
function generateChart(sheet){
  let datas = sheet.getRange(1,1,4,sheet.getLastColumn())
  let charts = sheet.getCharts()
  if(charts.length != 0){
    sheet.removeChart(charts[0])
  }
  console.log(sheet.getLastColumn())
  let chart = sheet.newChart()
          .addRange(datas)
          .asLineChart()
          .setPosition(5,1,0,0)
          .setOption("title","体重・体脂肪率・筋肉量の変化")
          .setTransposeRowsAndColumns(true)
          .build()
  sheet.insertChart(chart)
}