// เปลี่ยน Sheet1 เป็นชื่อชีตของคุณถ้าไม่ได้ใช้ชื่อนี้
var SHEET_NAME = "Sheet1"; 

// 1. รับคำสั่งแบบ GET (ใช้สำหรับดึงข้อมูลไปโชว์ในหน้า Admin)
function doGet(e) {
  var action = e.parameter.action;
  
  if (action === 'getUsers') {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    var data = sheet.getDataRange().getValues();
    var headers = data.shift(); // ดึงแถวแรก (หัวตาราง) ออกมา
    
    var users = data.map(function(row) {
      var obj = {};
      headers.forEach(function(header, i) {
        obj[header] = row[i];
      });
      return obj;
    });
    
    // ส่งข้อมูลกลับไปเป็น JSON
    return ContentService.createTextOutput(JSON.stringify(users))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

// 2. รับคำสั่งแบบ POST (ใช้สำหรับ สมัครสมาชิก และ ลบข้อมูล)
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  var action = e.parameter.action;

  // --- ระบบลบผู้ใช้งาน ---
  if (action === 'deleteUser') {
    var emailToDelete = e.parameter.email;
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var emailColIndex = headers.indexOf('email'); // หาว่าอีเมลอยู่คอลัมน์ไหน

    for (var i = 1; i < data.length; i++) {
      if (data[i][emailColIndex] === emailToDelete) {
        sheet.deleteRow(i + 1); // +1 เพราะ Array เริ่มที่ 0 แต่ชีตเริ่มที่ 1
        return ContentService.createTextOutput("Success");
      }
    }
    return ContentService.createTextOutput("Error: User not found");
  }

  // --- ระบบสมัครสมาชิก (โค้ดเดิมของคุณ) ---
  if (!action || action === 'register') {
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var newRow = [];
    for (var i = 0; i < headers.length; i++) {
      var header = headers[i];
      if (header.toLowerCase() === "timestamp") {
        newRow.push(new Date());
      } else {
        newRow.push(e.parameter[header] || "");
      }
    }
    sheet.appendRow(newRow);
    return ContentService.createTextOutput("Success");
  }
}