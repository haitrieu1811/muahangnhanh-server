export const USERS_MESSAGES = {
  REGISTER_SUCCESS: 'Đăng ký tài khoản thành công.',
  EMAIL_IS_REQUIRED: 'Email là bắc buộc.',
  EMAIL_IS_INVALID: 'Email không hợp lệ.',
  EMAIL_ALREADY_EXIST: 'Email đã tồn tại.',
  PASSWORD_IS_REQUIRED: 'Mật khẩu là bắt buộc.',
  PASSWORD_LENGTH_INVALID: 'Mật khẩu phải dài từ 8 đến 32 ký tự.',
  PASSWORD_IS_NOT_STRONG_ENOUGH:
    'Mật khẩu phải có ít nhất 1 ký tự viết thường, 1 ký tự viết hoa, 1 chữ số và một ký tự đặc biệt.',
  CONFIRM_PASSWORD_IS_REQUIRED: 'Nhập lại mật khẩu là bắc buộc.',
  CONFIRM_PASSWORD_IS_NOT_MATCH: 'Nhập lại mật khẩu không chính xác.',
  ROLE_IS_REQUIRED: 'Vai trò người dùng là bắt buộc.',
  ROLE_IS_INVALID: 'Vai trò người dùng không hợp lệ,',
  VERIFY_EMAIL_SUCCESS: 'Xác minh email thành công.',
  VERIFY_EMAIL_TOKEN_IS_REQUIRED: 'Verify email token là băc buộc.',
  VERIFY_EMAIL_TOKEN_NOT_EXIST: 'Verify email token không tồn tại.',
  INVALID_EMAIL_OR_PASSWORD: 'Email hoặc mật khẩu không chính xác.',
  LOGIN_SUCCESS: 'Đăng nhập thành công.',
  LOGOUT_SUCCESS: 'Đăng xuất thành công.',
  REFRESH_TOKEN_IS_REQUIRED: 'Refresh token là bắc buộc.',
  REFRESH_TOKEN_DOES_NOT_EXIST: 'Refresh token không tồn tại.',
  REFRESH_TOKEN_SUCCESS: 'Refresh token thành công.',
  ACCESS_TOKEN_IS_REQUIRED: 'Access token là bắt buộc.',
  GET_PROFILE_ME_SUCCESS: 'Lấy hồ sơ của tôi thành công.',
  UPDATE_ME_SUCCESS: 'Cập nhật tài khoản của tôi thành công.',
  FULLNAME_IS_REQUIRED: 'Họ tên là bắt buộc',
  FULLNAME_LENGTH_IS_INVALID: 'Họ tên phải có độ dài từ 1 đến 50 ký tự.',
  AVATAR_ID_IS_INVALID: 'Avatar ID không hợp lệ.',
  CHANGE_PASSWORD_SUCCESS: 'Đổi mật khẩu thành công.',
  OLD_PASSWORD_IS_REQUIRED: 'Mật khẩu cũ là bắt buộc.',
  OLD_PASSWORD_IS_INVALID: 'Mật khẩu cũ không chính xác.',
  RESET_PASSWORD_REQUEST_SUCCESS: 'Yêu cầu đặt lại mật khẩu thành công, vui lòng kiểm tra hòm thư email bạn vừa nhập.',
  EMAIL_DOES_NOT_EXIST: 'Email không tồn tại trên hệ thống.',
  RESET_PASSWORD_SUCCESS: 'Đặt lại mật khẩu thành công.',
  RESET_PASSWORD_TOKEN_IS_REQUIRED: 'Forgot password token là bắt buộc.',
  FORGOT_PASSWORD_TOKEN_DOES_NOT_EXIST: 'Forgot password token không tồn tại.'
} as const
