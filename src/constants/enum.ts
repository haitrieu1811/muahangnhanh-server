export enum UserVerifyStatus {
  Verified,
  Unverified
}

export enum UserStatus {
  Active,
  Inactive
}

export enum UserRole {
  Admin,
  Staff,
  Customer
}

export enum TokenType {
  AccessToken,
  RefreshToken,
  VerifyEmailToken,
  ForgotPasswordToken
}

export enum MediaType {
  Image,
  Video
}

export enum ProductCategoryStatus {
  Active,
  Inactive
}

export enum ProductStatus {
  Active,
  Inactive
}

export enum ProductApprovalStatus {
  Pending,
  Resolved,
  Rejected
}

export enum AddressType {
  Home,
  Office
}

export enum CartItemStatus {
  InCart,
  Waiting,
  Delivering,
  Success,
  Cancel
}
