# Ghi chú của tôi

Ứng dụng ghi chú cá nhân xây dựng với **Next.js App Router**, **TypeScript** và **Firebase Realtime Database**. Mỗi tài khoản chỉ có thể đọc và thay đổi ghi chú của chính mình.

## Yêu cầu

- Node.js 20 trở lên
- Một project Firebase có bật Authentication (Email/Password) và Realtime Database

## Cấu hình Firebase

1. Vào [Firebase Console](https://console.firebase.google.com/) và tạo hoặc chọn một project.
2. Trong **Authentication → Sign-in method**, bật **Email/Password**.
3. Tạo cơ sở dữ liệu trong **Realtime Database**. Ứng dụng lưu ghi chú tại nút `notes`, vì vậy dữ liệu sẽ xuất hiện trong Firebase Console → Realtime Database → Data → `notes`.
4. Vào **Project settings → Your apps**, tạo Web app và sao chép cấu hình SDK.
5. Tạo file `.env.local` từ file mẫu:

   ```bash
   cp .env.example .env.local
   ```

6. Điền bảy giá trị `NEXT_PUBLIC_FIREBASE_*` trong `.env.local` (bao gồm `NEXT_PUBLIC_FIREBASE_DATABASE_URL`). Đây là các cấu hình client công khai, không đặt private key hoặc service account vào ứng dụng.

## Chạy local

```bash
npm install
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000). Các lệnh kiểm tra:

```bash
npm run lint
npm run typecheck
npm run build
```

## Deploy Firebase rules

Cài Firebase CLI và đăng nhập:

```bash
npm install -g firebase-tools
firebase login
firebase use YOUR_FIREBASE_PROJECT_ID
firebase deploy --only database
```

Đảm bảo project Firebase đang được chọn đúng trước khi deploy rules. Rules giới hạn mọi thao tác theo `ownerId`, kiểm tra kiểu dữ liệu/kích thước trường, không cho phép trường tùy ý, đồng thời không cho phép thay đổi `ownerId` hoặc `createdAt`.

## Deploy ứng dụng

Bạn có thể deploy lên Vercel hoặc nền tảng Node.js bất kỳ:

```bash
npm run build
npm start
```

Khi deploy, khai báo cùng sáu biến môi trường `NEXT_PUBLIC_FIREBASE_*` trong phần Environment Variables của nền tảng.
