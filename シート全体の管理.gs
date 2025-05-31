BACKUP_FOLDER_ID = "14j8JbPOuNKaGNBobL5UXNTQ7Uee5bYRy"
//シートをバックアップする(復元するため)
function backUpSheets(){
  //削除する
  let backup_folder = DriveApp.getFolderById(BACKUP_FOLDER_ID)
  let backup_files = backup_folder.getFiles()
  while(backup_files.hasNext()){
    let backup_file = backup_files.next()
    backup_file.setTrashed(true)
  }
  //バックアップする(コピーする)
  let folder = DriveApp.getFolderById(FOLDER_ID)
  let files = folder.getFiles()
  while(files.hasNext()){
    let file = files.next()
    let file_name = file.getName()
    let backup_file_name = file_name + "のバックアップ"
    let backup_file = file.makeCopy(backup_file_name)
    DriveApp.getFolderById(BACKUP_FOLDER_ID).addFile(backup_file)
    DriveApp.getRootFolder().removeFile(backup_file)
  }
}

function whoIsPenalty(date){
  let people = []
  let folder = DriveApp.getFolderById(FOLDER_ID)
  let files = folder.getFiles()
  while(files.hasNext()){
    let file = files.next()
    let name = file.getName()
    let file_id = file.getId()
    let file_as_spreadsheet = SpreadsheetApp.openById(file_id)
    let sheet = file_as_spreadsheet.getSheetByName("記録用")
    date = new Date(date) //日付オブジェクトに変換する
    let today = new Date() //実行した日のオブジェクト
    let day = date.getDate() //何日か
    if(sheet.getRange(2+5*(Math.abs(date.getMonth() - today.getMonth())),day+1).getValue() == ""){
      people.push(name)
    }
  }
  return people
}