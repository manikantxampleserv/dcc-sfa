import 'package:flutter/foundation.dart';
import '../mock/mock_auth_data.dart';
import '../models/user_model.dart';

/**
 * Authentication and Session Provider for DCC Customer users.
 */
class AuthProvider with ChangeNotifier {
  UserModel? _currentUser;
  bool _isLoading = false;
  String? _errorMessage;

  UserModel? get currentUser => _currentUser;
  bool get isAuthenticated => _currentUser != null;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  AuthProvider() {
    _initSession();
  }

  void _initSession() {
    /** Auto-initialize with default mock customer session */
    _currentUser = MockAuthData.defaultCustomer;
    notifyListeners();
  }

  /**
   * Authenticates customer with email and password.
   */
  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    await Future.delayed(const Duration(milliseconds: 600));

    if (email.trim().toLowerCase() == MockAuthData.defaultCustomer.email.toLowerCase() &&
        password == MockAuthData.defaultPassword) {
      _currentUser = MockAuthData.defaultCustomer;
      _isLoading = false;
      notifyListeners();
      return true;
    } else {
      _errorMessage = 'Invalid email or password. Use demo credentials.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /**
   * Clears current customer session.
   */
  void logout() {
    _currentUser = null;
    notifyListeners();
  }
}
