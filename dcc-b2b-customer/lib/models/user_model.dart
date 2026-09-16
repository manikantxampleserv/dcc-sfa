/**
 * Model representing a DCC B2B Customer Account.
 */
class UserModel {
  final int id;
  final String name;
  final String email;
  final String role;
  final String company;
  final String sapCode;
  final String phone;

  const UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    required this.company,
    required this.sapCode,
    required this.phone,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as int,
      name: json['name'] as String,
      email: json['email'] as String,
      role: json['role'] as String,
      company: json['company'] as String,
      sapCode: json['sapCode'] as String,
      phone: json['phone'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'role': role,
      'company': company,
      'sapCode': sapCode,
      'phone': phone,
    };
  }
}
