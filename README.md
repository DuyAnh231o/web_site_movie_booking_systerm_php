# Tên đề tài:  WEBSITE ĐẶT VÉ XEM PHIM ONLINE


# Giới thiệu hệ thống

Website Đặt Vé Xem Phim Online là hệ thống hỗ trợ người dùng tìm kiếm phim, xem lịch chiếu và đặt vé trực tuyến thông qua giao diện website.  

Hệ thống được xây dựng nhằm mô phỏng quy trình hoạt động của một website đặt vé xem phim thực tế, giúp người dùng có thể:
- Đăng ký tài khoản
- Đăng nhập hệ thống
- Xem danh sách phim
- Xem chi tiết phim
- Xem suất chiếu
- Chọn ghế
- Đặt vé trực tuyến

Ngoài ra hệ thống còn hỗ trợ trang quản trị Admin giúp quản lý:
- Phim
- Người dùng
- Suất chiếu
- Booking
- Dashboard thống kê

# Danh sách thành viên

| Họ và tên | Vai trò |
|---|---|
| Nguyễn Vũ Anh - 23810310237 | Leader / Frontend |
| Bùi Việt Hoàng - 23810310241 | Backend |
| Nguyễn Bá Duy Anh - 23810310238 | Database/ Deploy |

---



# Phân công nhiệm vụ

| Thành viên | Công việc |
|---|---|
| Bùi Việt Hoàng | Xây dựng backend Laravel PHP, Kiểm thử hệ thống và viết tài liệu   |
| Nguyễn Vũ Anh | Thiết kế giao diện ReactJS, responsive UI |
| Nguyễn Bá Duy Anh | Thiết kế cơ sở dữ liệu MySQL, deploy VPS, cấu hình Nginx, |

---

# Công nghệ sử dụng

## Frontend
- ReactJS
- Vite
- Bootstrap
- Axios
- React Router DOM

## Backend
- Laravel PHP
- PHP-FPM

## Database
- MySQL

## Deploy
- Ubuntu VPS
- Nginx

---

# Hướng dẫn cài đặt

## Clone source code

- git clone <https://github.com/DuyAnh231o/web_site_movie_booking_systerm_php.git>

## Cài đặt frontend
- cd frontend
- npm install

## Cài đặt backend Laravel
- cd backend
- composer install

## Cấu hình file .env
- DB_CONNECTION=mysql
- DB_HOST=127.0.0.1
- DB_PORT=3306
- DB_DATABASE=movie_booking
- DB_USERNAME=root
- DB_PASSWORD=

## Chạy migration database
- php artisan migrate

# Hướng dẫn chạy project
## Chạy frontend ReactJS
- npm run dev

## Chạy backend Laravel
- php artisan serve

# Tài khoản demo website đã deploy 
## Admin 
- Tài khoản: duyanhth5@gmail.com
- Mật khẩu: boimixi36
## User
- Tài khoản: worogo9175@okcdeals.com
- Mật khẩu: boimixi36

# Hình ảnh minh họa hệ thống 
## Trang chủ User
<img width="975" height="841" alt="image" src="https://github.com/user-attachments/assets/84065e4a-e679-429b-82cb-c7a011ea4098" />

## Trang chọn suất chiếu, rạp User
<img width="1592" height="1316" alt="image" src="https://github.com/user-attachments/assets/39237c8b-5962-45a9-aa0e-c4334a8b036b" />

## Trang chọn ghế User
<img width="975" height="682" alt="image" src="https://github.com/user-attachments/assets/3954b5ba-20d6-4cfa-b318-8399d9112fd7" />

## Dashboard Admin
<img width="931" height="537" alt="image" src="https://github.com/user-attachments/assets/60271be1-4e40-4d5e-8974-f919a0a6db9b" />

## Quản lí phim Admin
<img width="975" height="536" alt="image" src="https://github.com/user-attachments/assets/3e106911-d16d-42b1-94c8-5173571b216f" />

## Quản lí suất chiếu Admin
<img width="975" height="536" alt="image" src="https://github.com/user-attachments/assets/788cbaf9-b778-4d57-9268-350e91551b2c" />

## Quản lí người dùng Admin
<img width="975" height="535" alt="image" src="https://github.com/user-attachments/assets/5328b9b0-700c-4a8d-8a31-3a9dfe19bc5e" />

# Link video demo
https://drive.google.com/drive/folders/1vka-3AF0a1c8rfwBVihi67xIeMNj6nCx?usp=drive_link

# Link web đã deploy 
- http://duyanh.name.vn



