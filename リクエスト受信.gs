//Getは体重シートのURLを見つける + ペナルティの補助機能
function doGet(e){
  let name = e.parameter.name
  let result
  console.log({name})
  //かなり歪な構造な気がする
  if(name == "Penalty"){
    let date = e.parameter.date
    let people = whoIsPenalty(date) //日付を元に検索する
    result = date+"の記録をつけていない人\n"
    for(let i=0;i<people.length;i++){
      result += people[i] + "\n"
    }
  }
  else{
    let files = DriveApp.getFilesByName(name)
    if(files.hasNext()){
      let file = files.next()
      result = file.getUrl()
    }
    else{
      result = "指定された名前の人のシートは見つかりませんでした。"
    }
  }
  console.log({result})
  return ContentService.createTextOutput(result)
}

//doGetのテスト用
function doGetTest(){
  e = {parameter:{name:"Penalty",date:"2022/7/1"}}
  doGet(e)
}

//Postはリクエストを処理する
function doPost(e){
  let device = e.parameter.device
  console.log({device})
  let params
  if(device == "Macrodroid"){
    params = e.parameter
  }
  else{
    params = JSON.parse(e.postData.getDataAsString())
  }
  console.log(params)
  let weight = params.weight
  let fat = params.fat
  let muscle = params.muscle
  let name = params.name
  let date = new Date(params.date)
  let today = new Date()
  if(Number.isNaN(date.getTime())){ //不正な日付の場合は、今日の日付に強制的に直す
    date = new Date(today.getFullYear(),today.getMonth(),today.getDate())
  }
  let one_week_ago = new Date()
  one_week_ago.setDate(one_week_ago.getDate() - 7)

  //処理の流れ:ファイルが無いなら新規作成→日付に応じて体重を記録する
  let files = DriveApp.getFolderById(FOLDER_ID).getFilesByName(name)
  let file
  if(files.hasNext()){ //ファイルが存在する場合は
    file = files.next() //そのファイルを取得
  }
  else{　//存在しない場合は
    file = generateSpreadsheet(name) //新しくファイルを生成
  }
  if(date > today){ //指定された日付が未来の場合は受理しない
    result = "未来の日付が指定されています。未来の体重を記録することはできません。"
  }
  else if(one_week_ago > date){
    result = "過去１週間より更に前の日付が指定されています。１週間前より過去の体重を記録することはできません。"
  }
  else{
    putInfomation(weight,fat,muscle,date,file) //日付を生成
    result = "記録しました\n体重: "+weight+"\n脂肪率: "+fat+"\n筋肉量: "+muscle+"\n氏名: "+name+"\n日付: "+date
  }
  return ContentService.createTextOutput(result)
}