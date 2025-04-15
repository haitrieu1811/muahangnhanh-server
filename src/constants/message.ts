export const UTILS_MESSAGES = {
  PAGE_MUST_BE_AN_INTEGER: 'Page phải là một số nguyên.',
  PAGE_MUST_BE_GREATER_THAN_ZERO: 'Page phải lớn hơn 0.',
  LIMIT_MUST_BE_AN_INTEGER: 'Limit phải là một số nguyên.',
  LIMIT_MUST_BE_GREATER_THAN_OR_EQUAL_ZERO: 'Limit phải là một số lớn hơn hoặc bằng 0.',
  PERMISSION_DENIED: 'Quyền truy cập API bị từ chối.',
  FILE_ID_IS_REQUIRED: 'ID file là bắt buộc',
  FILE_ID_IS_INVALID: 'ID file không hợp lệ.'
} as const

export const USERS_MESSAGES = {
  REGISTER_SUCCESS: 'Đăng ký tài khoản thành công.',
  EMAIL_IS_REQUIRED: 'Email là bắc buộc.',
  EMAIL_IS_INVALID: 'Email không hợp lệ.',
  EMAIL_ALREADY_EXIST: 'Email đã tồn tại.',
  PASSWORD_IS_REQUIRED: 'Mật khẩu là bắt buộc.',
  PASSWORD_LENGTH_INVALID: 'Mật khẩu phải dài từ 8 đến 32 ký tự.',
  PASSWORD_IS_NOT_STRONG_ENOUGH:
    'Mật khẩu phải có ít nhất 1 ký tự viết thường, 1 ký tự viết hoa, 1 chữ số và 1 ký tự đặc biệt.',
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
  FORGOT_PASSWORD_TOKEN_DOES_NOT_EXIST: 'Forgot password token không tồn tại.',
  GET_ALL_USERS_SUCCESS: 'Lấy danh sách tất cả người dùng thành công.',
  USER_ID_IS_REQUIRED: 'ID người dùng là bắt buộc.',
  USER_ID_IS_INVALID: 'ID người dùng không hợp lệ,',
  USER_NOT_FOUND: 'Không tìm thấy người dùng.',
  UNVERIFIED_USER: 'Người dùng chưa được xác minh,',
  INACTIVE_USER: 'Người dùng không hoạt động.',
  UPDATE_USER_SUCCESS: 'Cập nhật người dùng thành công.',
  STATUS_IS_INVALID: 'Trạng thái người dùng không hợp lệ.',
  DELETE_USER_SUCCESS: 'Xóa người dùng thành công.'
} as const

export const MEDIAS_MESSAGES = {
  IMAGE_FILE_TYPE_INVALID: 'Loại file ảnh không hợp lệ.',
  IMAGE_FIELD_IS_REQUIRED: 'Trường image là bắt buộc.',
  UPLOAD_IMAGE_SUCCEED: 'Tải ảnh lên thành công.',
  FILE_NOT_FOUND: 'Không tìm thấy file.'
} as const

export const PRODUCTS_MESSAGES = {
  CREATE_PRODUCT_CATEGORY_SUCCESS: 'Tạo danh mục sản phẩm thành công.',
  PRODUCT_CATEGORY_NAME_IS_REQUIRED: 'Tên danh mục sản phẩm là bắt buộc.',
  UPDATE_PRODUCT_CATEGORY_SUCCESS: 'Cập nhật danh mục sản phẩm thành công.',
  PRODUCT_CATEGORY_ID_IS_REQUIRED: 'ID danh mục sản phẩm là bắt buộc.',
  PRODUCT_CATEGORY_ID_IS_INVALID: 'ID danh mục sản phẩm không hợp lệ.',
  PRODUCT_CATEGORY_NOT_EXIST: 'Danh mục sản phẩm không tồn tại.',
  DELETE_PRODUCT_CATEGORY_SUCCESS: 'Xóa danh mục sản phẩm thành công.',
  GET_PRODUCT_CATEGORIES_SUCCESS: 'Lấy danh sách danh mục sản phẩm thành công.',
  CREATE_BRAND_SUCCESS: 'Tạo nhãn hiệu sản phẩm thành công.',
  UPDATE_BRAND_SUCCESS: 'Cập nhật nhãn hiệu sản phẩm thành công.',
  DELETE_BRAND_SUCCESS: 'Xóa nhãn hiệu sản phẩm thành công.',
  GET_BRANDS_SUCCESS: 'Lấy danh sách nhãn hiệu sản phẩm thành công.',
  BRAND_ID_IS_REQUIRED: 'ID nhãn hiệu sản phẩm là bắt buộc.',
  BRAND_ID_IS_INVALID: 'ID nhãn hiệu sản phẩm không hợp lệ.',
  BRAND_NOT_EXIST: 'Nhãn hiệu sản phẩm không tồn tại.',
  BRAND_NAME_IS_REQUIRED: 'Tên nhãn hiệu sản phẩm là bắt buộc.'
} as const
