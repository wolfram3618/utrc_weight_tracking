function dateTest(){
  let spread_sheet = SpreadsheetApp.getActiveSpreadsheet()
  let sheet_graph = spread_sheet.getSheetByName("グラフ用")
  let test_data = "2022/08/04"
  let test_date = new Date(test_data)
  let test_date2 = new Date()
  console.log(test_date)
  console.log(test_date2)
  console.log(test_date > test_date2)
  sheet_graph.getRange("A23").setValue()
}

function fileTest(){
  let file = DriveApp.getFolderById(FOLDER_ID).getFilesByName("入田健士朗")
  while(file.hasNext()){
    console.log(file.next().getName())
  }
}