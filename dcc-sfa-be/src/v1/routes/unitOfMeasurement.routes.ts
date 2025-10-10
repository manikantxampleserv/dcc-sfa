// import { Router } from 'express';
// import { authenticateToken } from '../../middlewares/auth.middleware';
// import { unitMeasurementController } from '../controllers/unitMeasurement.controller';
// import { createProductValidation } from '../validations/products.validation';
// import { validate } from '../../middlewares/validation.middleware';

// const router = Router();

// router.post(
//   '/unit-measurement',
//   authenticateToken,
//   createProductValidation,
//   validate,
//   unitMeasurementController.createUnitMeasurement
// );

// router.get(
//   '/unit-measurement',
//   authenticateToken,
//   unitMeasurementController.getAllUnitMeasurement
// );

// router.put(
//   '/unit-measurement/:id',
//   authenticateToken,
//   unitMeasurementController.updateUnitMeasurement
// );
// router.get(
//   '/unit-measurement/:id',
//   authenticateToken,
//   unitMeasurementController.getUnitMeasurementById
// );

// router.delete(
//   '/unit-measurement/:id',
//   authenticateToken,
//   unitMeasurementController.deleteUnitMeasurement
// );

// export default router;
