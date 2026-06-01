import express from 'express';
import { getOrganizationChart } from '../controllers/orgChart.controller';

const router = express.Router();

router.get('/', getOrganizationChart);

export default router;
