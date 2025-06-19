Attribute VB_Name = "ImportActivity"
Option Explicit

' === 使用說明 ===
' 1. 使用前端匯出的 CSV：activity_product<ID>.csv
' 2. 開啟範本 → Alt+F8 執行 "ImportActivityData"
' 3. 選擇 CSV → 自動匯入至《2.平台匯入表》Table，樣式完整保留

Sub ImportActivityData()
    Const SHEET_NAME As String = "2.平台匯入表"
    Const TABLE_NAME As String = "活動數據表"      ' ← 你的 Table 名稱
    Dim ws As Worksheet, tbl As ListObject
    Dim fName As Variant, txt As String, lines As Variant, i As Long
    
    ' 1) 選檔
    fName = Application.GetOpenFilename("CSV files (*.csv),*.csv", , "選擇匯入檔")
    If fName = False Then Exit Sub
    
    ' 2) 讀檔內容
    txt = CreateObject("Scripting.FileSystemObject") _
          .OpenTextFile(fName, 1, False, -1).ReadAll        ' -1 = Unicode 自動偵測
    lines = Split(txt, vbCrLf)
    If UBound(lines) < 1 Then
        MsgBox "檔案沒有資料！", vbExclamation: Exit Sub
    End If
    
    ' 3) 取得工作表 / Table
    Set ws = ThisWorkbook.Sheets(SHEET_NAME)
    On Error Resume Next
    Set tbl = ws.ListObjects(TABLE_NAME)
    On Error GoTo 0
    If tbl Is Nothing Then
        MsgBox "找不到 Table：" & TABLE_NAME, vbCritical: Exit Sub
    End If
    
    Application.ScreenUpdating = False
    
    ' 4) 清除舊資料
    If tbl.DataBodyRange Is Nothing Then
        ' 保留表頭
    Else
        tbl.DataBodyRange.Delete
    End If
    
    ' 5) 逐行塞資料
    For i = 1 To UBound(lines)   ' 跳過 header (index=0)
        If Trim(lines(i)) <> "" Then
            tbl.ListRows.Add
            tbl.ListRows(tbl.ListRows.Count).Range.Value = SplitCSV(lines(i))
        End If
    Next i
    
    Application.ScreenUpdating = True
    MsgBox "匯入完成，共 " & tbl.ListRows.Count & " 筆！", vbInformation
End Sub

' --- 把 CSV 1行拆成陣列（處理引號 / 逗號）---
Function SplitCSV(ByVal s As String) As Variant
    Dim regEx As Object, matches As Object, arr() As String, m, n As Long
    Set regEx = CreateObject("VBScript.RegExp")
    regEx.Pattern = "([^,""]+)|""((?:[^""]|"""")*)"""
    regEx.Global = True
    Set matches = regEx.Execute(s)
    ReDim arr(0 To matches.Count - 1)
    For Each m In matches
        arr(n) = Replace(m.SubMatches(1), """""", """")
        n = n + 1
    Next
    SplitCSV = arr
End Function
