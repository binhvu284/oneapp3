# OneApp: Đánh giá & Kế hoạch phát triển phiên bản 2.7

Bản tài liệu này phân tích tình trạng hiện tại của dự án OneApp (phiên bản 2.6.8) và đề xuất lộ trình chiến lược cho bản cập nhật lớn 2.7. Mục tiêu là biến OneApp trở nên mạnh mẽ, tối ưu và hoàn thiện hơn, đồng thời giải quyết các khoản nợ kỹ thuật (technical debt).

---

## Phần 1: Đánh giá hệ thống hiện tại (V2.6.8)

### 1. Điểm mạnh

- **Kiến trúc Module hóa rất tốt:** Việc chia tách các ứng dụng nhỏ như OneCrypto, OneNote, OneApp AI giúp hệ thống có khả năng mở rộng vô hạn.
- **Hệ thống giao diện (UI) hiện đại:** Sử dụng Radix UI và TailwindCSS cung cấp một nền tảng thiết kế xuất sắc, dễ tùy biến.
- **Tùy biến cao:** Khả năng cho phép người dùng tự thay đổi giao diện, bố cục (Dashboard Grid) và cài đặt kết nối hệ thống (Supabase riêng).
- **Phân quyền rõ ràng:** Đã có hệ thống Role đầy đủ (User, Developer, Partner).

### 2. Các vấn đề & Khía cạnh cần cải thiện (Tech Debt & Optimization)

- **Rủi ro rò rỉ bộ nhớ & Hiệu suất:** Quá nhiều module đang được load cùng lúc có thể gây quá tải. Cần áp dụng sâu hơn tính năng Lazy Loading (hiện tại `App.tsx` có dùng `React.lazy` nhưng cần tối ưu hóa cấp độ component bên trong các trang).
- **Trải nghiệm AI (OneApp AI) chưa đồng bộ:** Giao diện AI Chat đã được cải thiện (dựa trên lịch sử phát triển) nhưng hệ thống Agent Memory và File Context cần được tối ưu hóa về mặt truy xuất cơ sở dữ liệu để phản hồi nhanh hơn.
- **Code Duplication (Lặp code):** Các sub-app như OneNote và OneCrypto có thể đang có sự lặp lại trong cách quản lý state (danh sách, crud). Cần tạo thêm các Custom Hooks dùng chung chuẩn hóa.
- **Thiết kế Responsive (Mobile):** Các bảng điều khiển dạng Grid (`react-grid-layout`) thường gặp khó khăn trên màn hình nhỏ. Cần kiểm tra và tối ưu lại trải nghiệm trên điện thoại.
- **Kết nối External API:** Hiện tại bảng `apis` và `external_connections` đang ở trạng thái phát triển. Cần có một chuẩn mã hóa an toàn hơn (Encryption) cho API keys của người dùng.

---

## Phần 2: Đề xuất kế hoạch phát triển OneApp 2.7

**Vision:** "OneApp 2.7 - Kỷ nguyên của tốc độ, bảo mật và sự liền mạch trong AI"

### Giai đoạn 1: Refactoring & Tối ưu hóa hệ thống lõi (Giảm Tech Debt)

1. **Chuẩn hóa truy xuất dữ liệu:** Chuyển đổi hoàn toàn sang sử dụng `@tanstack/react-query` hooks cho mọi tác vụ lấy dữ liệu ở các module con, loại bỏ các `useEffect` fetch data rườm rà.
2. **Kiểm tra và Tối ưu hóa Memory:** Áp dụng `useMemo` và `useCallback` chặt chẽ trong `DashboardGrid` và `AIChat` để tránh re-render không cần thiết.
3. **Bảo mật API Key:** Triển khai cơ chế mã hóa (Vault/KMS mô phỏng hoặc chuẩn mã hóa AES) ở client/server cho tất cả các key lưu trong bảng `crypto_platforms`, `user_api_keys`.

### Giai đoạn 2: Nâng cấp tính năng (Feature Upgrades)

1. **OneApp AI 2.0:**
   - Cải tiến UI Chatbot trở nên chuyên nghiệp như các nền tảng lớn (Gemini, ChatGPT) với khả năng Markdown & Syntax Highlighting mượt mà hơn.
   - Hỗ trợ Voice Chat hoặc Text-to-Speech (tích hợp ElevenLabs).
2. **Widget Ecosystem Mở rộng:**
   - Cho phép các module như OneCrypto và OneNote đẩy dữ liệu ra các màn hình Widget thu nhỏ trên Dashboard.
3. **App Store (Marketplace nội bộ):**
   - Biến trang Explore thành một Marketplace để "cài đặt" hoặc bật/tắt các module tích hợp, quản lý trực tiếp qua bảng `in_use_apps`.

### Giai đoạn 3: Hoàn thiện UX/UI và Micro-interactions

1. **Animation:** Thêm vào Framer Motion / AnimeJS cho các thao tác mượt mà khi chuyển đổi giữa các module thay vì chỉ tải trang thuần túy.
2. **Global Search (Command Menu):** Cải thiện tính năng Cmd+K (bằng `cmdk`) để có thể tìm kiếm xuyên suốt ghi chú (OneNote), mã báo giá (OneCrypto) và tin nhắn (OneApp AI).

### Giai đoạn 4: Quality Assurance (Kiểm thử)

1. Viết Unit Tests (bằng Vitest) cho các hàm xử lý dữ liệu lõi và các Custom Hooks (`useSchemaSync`).
2. Tối ưu hóa cho SEO & Web Vitals nội bộ (thời gian tải trang đầu tiên < 1.5s).

---

Bản kế hoạch này đóng vai trò như một la bàn định hướng cho các dev và AI agent để phát triển độc lập các tính năng mà không phá vỡ tính nguyên thuật của cấu trúc dự án.
