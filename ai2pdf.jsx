// Tắt các cảnh báo (bao gồm cảnh báo lỗi font) để không làm gián đoạn
var oldInteractionLevel = app.userInteractionLevel;
app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

// Chọn thư mục chứa file AI (input)
var inputFolder = Folder.selectDialog("Chọn thư mục chứa file AI");
if (inputFolder == null) {
    alert("Bạn chưa chọn thư mục input. Script sẽ kết thúc.");
    exit();
}

// Chọn thư mục lưu file PDF (output)
var outputFolder = Folder.selectDialog("Chọn thư mục lưu file PDF");
if (outputFolder == null) {
    alert("Bạn chưa chọn thư mục output. Script sẽ kết thúc.");
    exit();
}

/**
 * Hàm đệ quy quét thư mục và xử lý chuyển đổi file AI sang PDF.
 *
 * @param {Folder} currentFolder - Thư mục hiện tại cần quét.
 * @param {Folder} outputBaseFolder - Thư mục gốc xuất file PDF.
 * @param {Folder} inputBaseFolder - Thư mục gốc của file AI để xác định đường dẫn tương đối.
 */
function processFolder(currentFolder, outputBaseFolder, inputBaseFolder) {
    var items = currentFolder.getFiles();
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item instanceof Folder) {
            // Nếu là thư mục, gọi đệ quy
            processFolder(item, outputBaseFolder, inputBaseFolder);
        } else if (item instanceof File && item.name.match(/\.ai$/i)) {
            try {
                // Xác định đường dẫn tương đối của file so với thư mục gốc input
                var relativePath = item.parent.fsName.replace(inputBaseFolder.fsName, "");
                // Loại bỏ dấu "/" hoặc "\" ở đầu nếu có
                if (relativePath.charAt(0) === "/" || relativePath.charAt(0) === "\\") {
                    relativePath = relativePath.substring(1);
                }
                
                // Tạo thư mục tương ứng trong output (nếu chưa tồn tại)
                var outFolderPath = outputBaseFolder.fsName + "/" + relativePath;
                var outFolder = new Folder(outFolderPath);
                if (!outFolder.exists) {
                    outFolder.create();
                }
                
                // Mở file AI
                var doc = app.open(item);
                
                // Lấy tên file không bao gồm phần mở rộng
                var baseName = item.name.substring(0, item.name.lastIndexOf('.'));
                // Tạo đường dẫn file PDF trong thư mục tương ứng
                var pdfFile = new File(outFolder.fsName + "/" + baseName + ".pdf");
                
                // Thiết lập các tùy chọn lưu PDF
                var pdfOptions = new PDFSaveOptions();
                pdfOptions.preserveEditability = false;
                
                // Lưu file dưới dạng PDF và đóng tài liệu
                doc.saveAs(pdfFile, pdfOptions);
                doc.close(SaveOptions.DONOTSAVECHANGES);
            } catch (e) {
                // Ghi log lỗi (nếu cần) và tiếp tục với file kế tiếp
                $.writeln("Lỗi xử lý file: " + item.fsName + "\nChi tiết: " + e);
            }
        }
    }
}

// Gọi hàm xử lý bắt đầu từ thư mục input gốc
processFolder(inputFolder, outputFolder, inputFolder);

// Khôi phục lại mức độ tương tác ban đầu của ứng dụng
app.userInteractionLevel = oldInteractionLevel;

alert("Xuất PDF hoàn tất!");
