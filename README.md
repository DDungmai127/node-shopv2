# nodejs_none_DB

Bản có db sẽ được đẩy sang một branch khác

-   Version None-database : branch main
-   Version My sql : branch
-   Version chỉ sử dụng mongodb : mongo-driver
-   Version sử dụng mongoose : db_u_mongoose

Chú ý rằng : Session lưu dữ liệu của user nó chỉ lưu dữ liệu đơn thuần chứ không kèm theo các phương thức (kể cả các phương thức tự định nghĩa hoặc của mongoose) nên không thể thực hiện một số chức năng. Do đó ta phải sử dụng biện pháp thay thế !
