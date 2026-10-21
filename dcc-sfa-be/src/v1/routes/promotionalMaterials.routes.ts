import { Router } from 'express';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';
import { promotionalMaterialsController } from '../controllers/promotionalMaterials.controller';
import {
  createPromotionalMaterialValidation,
  updatePromotionalMaterialValidation,
} from '../validations/promotionalMaterials.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/promotional-materials',
  authenticateToken,
  auditCreate('promotional_materials'),
  requirePermission([{ module: 'promotion-materials', action: 'create' }]),
  createPromotionalMaterialValidation,
  validate,
  promotionalMaterialsController.createPromotionalMaterial
);

router.get(
  '/promotional-materials',
  authenticateToken,
  requirePermission([{ module: 'promotion-materials', action: 'read' }]),
  promotionalMaterialsController.getPromotionalMaterials
);

router.get(
  '/promotional-materials/outlet/:outletId',
  authenticateToken,
  requirePermission([{ module: 'promotion-materials', action: 'read' }]),
  promotionalMaterialsController.getOutletPromotionalMaterials
);

router.get(
  '/promotional-materials/:id',
  authenticateToken,
  requirePermission([{ module: 'promotion-materials', action: 'read' }]),
  promotionalMaterialsController.getPromotionalMaterialById
);

router.put(
  '/promotional-materials/:id',
  authenticateToken,
  auditUpdate('promotional_materials'),
  requirePermission([{ module: 'promotion-materials', action: 'update' }]),
  updatePromotionalMaterialValidation,
  validate,
  promotionalMaterialsController.updatePromotionalMaterial
);

router.delete(
  '/promotional-materials/:id',
  authenticateToken,
  auditDelete('promotional_materials'),
  requirePermission([{ module: 'promotion-materials', action: 'delete' }]),
  promotionalMaterialsController.deletePromotionalMaterial
);

export default router;
