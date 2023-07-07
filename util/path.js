const path = require("path");
// cái này sẽ trả về là: ../section-5
module.exports = path.dirname(require.main.filename);
//path.dirname(require.main.filename) là một cách để lấy đường dẫn thư mục chứa tệp tin gốc (root file) mà được chạy bởi Node.js.

//Khi bạn sử dụng require.main.filename để lấy tên tệp tin gốc, thì path.dirname() sẽ trả về đường dẫn thư mục chứa tệp tin đó. Ví dụ, nếu tên tệp tin gốc là /home/user/app.js, thì path.dirname(require.main.filename) sẽ trả về /home/user.

//Việc sử dụng path.dirname(require.main.filename) có thể hữu ích trong việc làm việc với các tệp tin khác trong cùng thư mục với tệp tin gốc, hoặc trong việc xác định các đường dẫn tương đối đến các tệp tin khác trong ứng dụng của bạn.
