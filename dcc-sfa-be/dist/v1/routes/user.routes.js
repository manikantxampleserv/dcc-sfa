"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const user_controller_1 = require("../controllers/user.controller");
const user_validation_1 = require("../validations/user.validation");
const multer_1 = require("../../utils/multer");
const router = (0, express_1.Router)();
// Create user - using dynamic module/action
router.post('/users', multer_1.upload.single('profile_image'), auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('users'), (0, auth_middleware_1.requirePermission)([{ module: 'user', action: 'create' }]), user_validation_1.createUserValidation, user_controller_1.userController.createUser);
// Get own profile - using dynamic module/action
router.get('/users/me', auth_middleware_1.authenticateToken, user_controller_1.userController.getUserProfile);
// Update own profile - using dynamic module/action
router.put('/users/me', auth_middleware_1.authenticateToken, multer_1.upload.single('profile_image'), user_validation_1.updateUserValidation, user_controller_1.userController.updateUserProfile);
// Get all users - using dynamic module/action
router.get('/users', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'user', action: 'read' }]), user_controller_1.userController.getUsers);
// Get user by ID - using dynamic module/action
router.get('/users/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'user', action: 'read' }]), user_controller_1.userController.getUserById);
// Update user - using dynamic module/action
router.put('/users/:id', auth_middleware_1.authenticateToken, multer_1.upload.single('profile_image'), (0, audit_middleware_1.auditUpdate)('users'), (0, auth_middleware_1.requirePermission)([{ module: 'user', action: 'update' }]), user_validation_1.updateUserValidation, user_controller_1.userController.updateUser);
// Delete user - using dynamic module/action
router.delete('/users/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('users'), (0, auth_middleware_1.requirePermission)([{ module: 'user', action: 'delete' }]), user_controller_1.userController.deleteUser);
router.get('/users-dropdown', auth_middleware_1.authenticateToken, user_controller_1.userController.getUsersDropdown);
exports.default = router;
//# sourceMappingURL=user.routes.js.map