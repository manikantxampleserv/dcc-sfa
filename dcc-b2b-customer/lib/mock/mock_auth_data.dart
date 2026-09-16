import '../models/user_model.dart';

/**
 * Mock customer credentials and profile data.
 * Matches default customer profile used in DCC B2B web.
 */
abstract final class MockAuthData {
  static const UserModel defaultCustomer = UserModel(
    id: 1,
    name: 'Ahmed Al-Rashid',
    email: 'ahmed@stockist.co.tz',
    role: 'customer',
    company: 'Al-Rashid Distributors Ltd',
    sapCode: 'SAP-001234',
    phone: '+255 712 345 678',
  );

  static const String defaultPassword = 'password';
}
