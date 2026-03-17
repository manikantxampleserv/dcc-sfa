import { body } from 'express-validator';

export const createCustomerValidation = [
  body('name')
    .notEmpty()
    .withMessage('Customer name is required')
    .isString()
    .withMessage('Customer name must be a string'),

  body('depot_id')
    .exists()
    .withMessage('Depot selection is required')
    .isInt()
    .withMessage('Depot ID must be a number'),

  body('zone_id')
    .optional({ checkFalsy: true })
    .isInt()
    .withMessage('Zone ID must be a number'),

  body('zones_id')
    .optional({ checkFalsy: true })
    .isInt()
    .withMessage('Zone ID must be a number'),

  body('short_name')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('Short name must be a string'),

  body('customer_type_id')
    .optional({ checkFalsy: true })
    .isInt()
    .withMessage('Customer type ID must be a number'),

  body('customer_channel_id')
    .optional({ checkFalsy: true })
    .isInt()
    .withMessage('Customer channel ID must be a number'),

  body('customer_category_id')
    .optional({ checkFalsy: true })
    .isInt()
    .withMessage('Customer category ID must be a number'),

  body('type')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('Type must be a string'),

  body('internal_code_one')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('Internal code one must be a string'),

  body('internal_code_two')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('Internal code two must be a string'),

  body('contact_person')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('Contact person must be a string'),

  body('phone_number')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('Phone number must be a string'),

  body('email')
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage('Email must be a valid email address'),

  body('address')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('Address must be a string'),

  body('city')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('City must be a string'),

  body('state')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('State must be a string'),

  body('zipcode')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('Zipcode must be a string'),

  body('latitude')
    .optional({ checkFalsy: true })
    .isDecimal()
    .withMessage('Latitude must be a decimal number'),

  body('longitude')
    .optional({ checkFalsy: true })
    .isDecimal()
    .withMessage('Longitude must be a decimal number'),

  body('credit_limit')
    .optional({ checkFalsy: true })
    .isDecimal()
    .withMessage('Credit limit must be a decimal number'),

  body('outstanding_amount')
    .optional({ checkFalsy: true })
    .isDecimal()
    .withMessage('Outstanding amount must be a decimal number'),

  body('route_id')
    .optional({ checkFalsy: true })
    .isInt()
    .withMessage('Route ID must be a number'),

  body('salesperson_id')
    .optional({ checkFalsy: true })
    .isInt()
    .withMessage('Salesperson ID must be a number'),

  body('nfc_tag_code')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('NFC tag code must be a string'),

  body('is_active')
    .optional({ checkFalsy: true })
    .isIn(['Y', 'N'])
    .withMessage('is_active must be Y or N'),
];
