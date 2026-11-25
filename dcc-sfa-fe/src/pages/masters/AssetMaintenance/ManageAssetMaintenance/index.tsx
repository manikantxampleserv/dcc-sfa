import { Add } from '@mui/icons-material';
import {
  Alert,
  Box,
  Checkbox,
  Chip,
  FormControlLabel,
  MenuItem,
  Skeleton,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import {
  useAssetMaintenanceById,
  useAssignMaintenanceTechnician,
  useCloseMaintenanceJob,
  useCreateAssetMaintenance,
  useUpdateAssetMaintenance,
  type AssetMaintenance,
} from 'hooks/useAssetMaintenance';
import { useCurrency } from 'hooks/useCurrency';
import { CheckCircle, Clock, Flag, Shield, Truck } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assetMaintenanceValidationSchema } from 'schemas/assetMaintenance.schema';
import { DeleteButton } from 'shared/ActionButton';
import ActiveInactiveField from 'shared/ActiveInactiveField';
import AssetSelect from 'shared/AssetSelect';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import UserSelect from 'shared/UserSelect';
import {
  formatDate,
  formatDateTime,
  formatForDateInput,
} from 'utils/dateUtils';
import {
  formatCoolerTitle,
  formatSparesPayload,
  formatStageLabel,
  getTicketStages,
  mapApiSparesToRows,
  normalizeTicketStatus,
  resolveTicketLocations,
  type SpareRow,
} from './ticketHelpers';
import WorkshopReturnModal, {
  type WorkshopModalMode,
} from './WorkshopReturnModal';

interface ManageAssetMaintenanceProps {
  selectedMaintenance?: AssetMaintenance | null;
  setSelectedMaintenance: (maintenance: AssetMaintenance | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

/**
 * Skeleton loader component representing the asset maintenance drawer layout while ticket details load.
 * @returns {React.ReactElement} Drawer skeleton element.
 */
const MaintenanceDrawerSkeleton: React.FC = () => (
  <Box className="!space-y-4">
    <Box className="!flex !items-center !gap-2">
      <Skeleton
        variant="rounded"
        width={90}
        height={26}
        className="!rounded-full"
      />
      <Skeleton
        variant="rounded"
        width={110}
        height={26}
        className="!rounded-full"
      />
    </Box>

    <Box className="!bg-white !border !border-gray-200 !rounded-lg !p-4 !shadow-sm">
      <Box className="!flex !items-center !justify-between !gap-2">
        {[1, 2, 3, 4].map(idx => (
          <Box key={idx} className="!flex-1">
            <Skeleton
              variant="rounded"
              width="100%"
              height={28}
              className="!rounded-full"
            />
          </Box>
        ))}
      </Box>
    </Box>

    <Box className="!bg-slate-50 !p-4 !rounded-lg !border !border-gray-200 !shadow-sm !grid !grid-cols-1 md:!grid-cols-2 !gap-x-6 !gap-y-3">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <Box key={i} className="!space-y-1">
          <Skeleton variant="text" width={70} height={14} />
          <Skeleton variant="text" width="75%" height={20} />
        </Box>
      ))}
    </Box>

    <Box className="!bg-white !p-4 !rounded-lg !border !border-gray-200 !shadow-sm !space-y-3">
      <Skeleton variant="text" width={140} height={20} />
      <Box className="!grid !grid-cols-1 md:!grid-cols-3 !gap-3">
        <Skeleton variant="rounded" height={42} className="!rounded-md" />
        <Skeleton variant="rounded" height={42} className="!rounded-md" />
        <Skeleton variant="rounded" height={42} className="!rounded-md" />
      </Box>
    </Box>

    <Box className="!bg-white !p-4 !rounded-lg !border !border-gray-200 !shadow-sm !space-y-3">
      <Skeleton variant="text" width={160} height={20} />
      <Skeleton variant="rounded" height={64} className="!rounded-md" />
      <Box className="!pt-2 !space-y-2">
        <Skeleton variant="text" width={140} height={18} />
        <Skeleton variant="rounded" height={88} className="!rounded-md" />
      </Box>
    </Box>

    <Box className="!flex !justify-end !gap-3 !pt-2">
      <Skeleton
        variant="rounded"
        width={80}
        height={36}
        className="!rounded-md"
      />
      <Skeleton
        variant="rounded"
        width={120}
        height={36}
        className="!rounded-md"
      />
    </Box>
  </Box>
);

/**
 * ManageAssetMaintenance Component.
 * Implements the repair job workflow drawer (On-site, Workshop, and Complaint flows)
 * using DCC-SFA shared UI components, tables, and responsive cards.
 *
 * @param {ManageAssetMaintenanceProps} props Component props.
 * @returns {React.ReactElement} Drawer element.
 */
const ManageAssetMaintenance: React.FC<ManageAssetMaintenanceProps> = ({
  selectedMaintenance,
  setSelectedMaintenance,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedMaintenance;
  const maintenanceId = selectedMaintenance?.id || 0;
  const { formatCurrency } = useCurrency();
  const navigate = useNavigate();

  const {
    data: freshData,
    isLoading: isDetailsLoading,
    refetch: refetchDetails,
  } = useAssetMaintenanceById(maintenanceId, {
    enabled: isEdit && drawerOpen,
  });

  const activeTicket: AssetMaintenance | null =
    freshData || selectedMaintenance || null;

  const createAssetMaintenanceMutation = useCreateAssetMaintenance();
  const updateAssetMaintenanceMutation = useUpdateAssetMaintenance();
  const assignTechnicianMutation = useAssignMaintenanceTechnician();
  const closeJobMutation = useCloseMaintenanceJob();

  const [returnModalState, setReturnModalState] = useState<{
    open: boolean;
    mode: WorkshopModalMode;
  }>({ open: false, mode: 'return' });

  const [assignedTechId, setAssignedTechId] = useState<number | string>('');
  const [ticketPriority, setTicketPriority] = useState<string>('medium');
  const [ticketDueDate, setTicketDueDate] = useState<string>('');

  const [newPartName, setNewPartName] = useState<string>('');
  const [newPartQty, setNewPartQty] = useState<number>(1);
  const [newPartUnitCost, setNewPartUnitCost] = useState<number | string>('');
  const [sparesList, setSparesList] = useState<SpareRow[]>([]);

  useEffect(() => {
    if (activeTicket) {
      setAssignedTechId(activeTicket.technician_id || '');
      setTicketPriority(activeTicket.priority || 'medium');
      setTicketDueDate(
        activeTicket.due_date ? formatForDateInput(activeTicket.due_date) : ''
      );
      setSparesList(mapApiSparesToRows(activeTicket.spares));
    } else {
      setAssignedTechId('');
      setTicketPriority('medium');
      setTicketDueDate('');
      setSparesList([]);
    }
  }, [activeTicket]);

  const initialValues = useMemo(
    () => ({
      asset_id: selectedMaintenance?.asset_id?.toString() || '',
      maintenance_date: formatForDateInput(
        selectedMaintenance?.maintenance_date
      ),
      issue_reported: selectedMaintenance?.issue_reported || '',
      action_taken: selectedMaintenance?.action_taken || '',
      technician_id: selectedMaintenance?.technician_id?.toString() || '',
      priority: selectedMaintenance?.priority || 'medium',
      repair_location: selectedMaintenance?.repair_location || 'onsite',
      cost: selectedMaintenance?.cost?.toString() || '',
      remarks: selectedMaintenance?.remarks || '',
      is_active: selectedMaintenance?.is_active || 'Y',
      spares: [] as SpareRow[],
    }),
    [selectedMaintenance]
  );

  const formik = useFormik({
    initialValues,
    validationSchema: assetMaintenanceValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const formattedSpares = formatSparesPayload(sparesList);

        const submitData = {
          asset_id: Number(values.asset_id),
          maintenance_date: values.maintenance_date,
          issue_reported: values.issue_reported,
          action_taken: values.action_taken,
          technician_id: values.technician_id
            ? Number(values.technician_id)
            : undefined,
          priority: values.priority,
          repair_location: values.repair_location,
          cost: values.cost ? Math.max(0, Number(values.cost)) : undefined,
          remarks: values.remarks,
          is_active: values.is_active,
          spares: formattedSpares,
        };

        if (isEdit && selectedMaintenance) {
          await updateAssetMaintenanceMutation.mutateAsync({
            id: selectedMaintenance.id,
            data: submitData,
          });
        } else {
          await createAssetMaintenanceMutation.mutateAsync(submitData);
        }
        handleCancel();
      } catch (error) {
        console.error('Error submitting asset maintenance:', error);
      }
    },
  });

  const handleCancel = () => {
    setSelectedMaintenance(null);
    setDrawerOpen(false);
    setReturnModalState({ open: false, mode: 'return' });
    formik.resetForm();
    setNewPartName('');
    setNewPartQty(1);
    setNewPartUnitCost('');
    setSparesList([]);
  };

  const handlePriorityChange = (newPrio: string) => {
    setTicketPriority(newPrio);
    const d = new Date();
    if (newPrio === 'high') {
      d.setDate(d.getDate() + 2);
    } else if (newPrio === 'medium') {
      d.setDate(d.getDate() + 5);
    } else {
      d.setDate(d.getDate() + 10);
    }
    setTicketDueDate(formatForDateInput(d.toISOString()));
  };

  const handleUpdateAssignment = async () => {
    if (!activeTicket?.id || !assignedTechId) return;
    try {
      await assignTechnicianMutation.mutateAsync({
        id: activeTicket.id,
        data: {
          technician_id: Number(assignedTechId),
          priority: ticketPriority,
          due_date: ticketDueDate
            ? new Date(ticketDueDate).toISOString()
            : undefined,
        },
      });
      await refetchDetails();
    } catch (error) {
      console.error('Failed to update assignment:', error);
    }
  };

  const handleAddSparePart = () => {
    if (!newPartName.trim()) return;
    const unitCost = Math.max(0, Number(newPartUnitCost) || 0);
    const qty = Math.max(1, Number(newPartQty) || 1);
    const newRow: SpareRow = {
      tempId: `sp_${Date.now()}`,
      name: newPartName.trim(),
      quantity: qty,
      unit_cost: unitCost,
    };
    setSparesList(prev => [...prev, newRow]);
    setNewPartName('');
    setNewPartQty(1);
    setNewPartUnitCost('');
  };

  const handleRemoveSpare = (index: number) => {
    setSparesList(prev => prev.filter((_, i) => i !== index));
  };

  const handleSpareUnitCostChange = (index: number, rawValue: string) => {
    const sanitized = rawValue.replace(/-/g, '');
    const parsedCost =
      sanitized === '' ? 0 : Math.max(0, Number(sanitized) || 0);
    setSparesList(prev =>
      prev.map((item, idx) =>
        idx === index ? { ...item, unit_cost: parsedCost } : item
      )
    );
  };

  const hasSpareChanges = useMemo(() => {
    const saved = formatSparesPayload(mapApiSparesToRows(activeTicket?.spares));
    const current = formatSparesPayload(sparesList);

    if (saved.length !== current.length) return true;
    return current.some(
      (item, idx) =>
        item.name !== saved[idx].name ||
        item.quantity !== saved[idx].quantity ||
        item.unit_cost !== saved[idx].unit_cost
    );
  }, [activeTicket?.spares, sparesList]);

  const handleUpdateSpares = async () => {
    if (!activeTicket?.id) return;
    try {
      await updateAssetMaintenanceMutation.mutateAsync({
        id: activeTicket.id,
        data: {
          spares: formatSparesPayload(sparesList),
        },
      });
      await refetchDetails();
    } catch (error) {
      console.error('Failed to update spare parts:', error);
    }
  };

  const sparesTotalCost = useMemo(
    () =>
      sparesList.reduce(
        (sum, item) =>
          sum + (Number(item.quantity) || 1) * (Number(item.unit_cost) || 0),
        0
      ),
    [sparesList]
  );

  const totalTicketCost = sparesTotalCost;

  const handleCloseJob = async () => {
    if (!activeTicket?.id) return;
    try {
      await closeJobMutation.mutateAsync({
        id: activeTicket.id,
        data: {
          labour_cost: 0,
          spares: formatSparesPayload(sparesList),
          remarks: activeTicket.remarks || undefined,
        },
      });
      await refetchDetails();
    } catch (error) {
      console.error('Failed to close job:', error);
    }
  };

  const handleToggleWarrantyClaim = async (checked: boolean) => {
    if (!activeTicket?.id) return;
    try {
      await updateAssetMaintenanceMutation.mutateAsync({
        id: activeTicket.id,
        data: { warranty_claim: checked },
      });
      await refetchDetails();
    } catch (error) {
      console.error('Failed to update warranty claim:', error);
    }
  };

  const currentStatus = normalizeTicketStatus(activeTicket);
  const stages = useMemo(() => getTicketStages(activeTicket), [activeTicket]);
  const stageIndex =
    stages.indexOf(currentStatus) >= 0 ? stages.indexOf(currentStatus) : 0;

  const {
    isWorkshop,
    workshopReturnInfo,
    originalOutlet,
    workshopDepot,
    isAtDepot,
  } = useMemo(
    () => resolveTicketLocations(activeTicket, currentStatus),
    [activeTicket, currentStatus]
  );

  const warrantyExpiry =
    activeTicket?.asset_maintenance_master?.warranty_expiry;
  const isUnderWarranty = Boolean(
    warrantyExpiry && new Date(warrantyExpiry) >= new Date()
  );
  const hasWarrantyClaim =
    activeTicket?.warranty_claim === true ||
    activeTicket?.warranty_claim === 'Y';

  const outletInfo = useMemo(() => {
    const master = activeTicket?.asset_maintenance_master;
    if (isAtDepot && (workshopDepot?.name || master?.current_location)) {
      return `${workshopDepot?.name || master?.current_location} (Depot)`;
    }
    if (originalOutlet?.name) {
      return `${originalOutlet.name}${originalOutlet.code ? ` (${originalOutlet.code})` : ''}`;
    }
    if (master?.current_location) {
      return master.current_location;
    }
    return workshopDepot?.name
      ? `${workshopDepot.name} (Depot)`
      : 'Unassigned Location';
  }, [activeTicket, isAtDepot, originalOutlet, workshopDepot]);

  const coolerTitle = useMemo(
    () => formatCoolerTitle(activeTicket?.asset_maintenance_master),
    [activeTicket?.asset_maintenance_master]
  );

  const spareColumns: TableColumn<SpareRow>[] = useMemo(
    () => [
      {
        id: 'name',
        label: 'Part Name',
        render: (_value, row) => (
          <span className="font-medium text-gray-800">{row.name}</span>
        ),
      },
      {
        id: 'quantity',
        label: 'Qty',
        width: 80,
        render: (_value, row) => (
          <span className="text-gray-600">{row.quantity}</span>
        ),
      },
      {
        id: 'unit_cost',
        label: 'Unit Cost',
        width: 150,
        render: (_value, row, rowIndex) =>
          isEdit && currentStatus !== 'closed' ? (
            <Input
              type="number"
              compact
              size="small"
              value={row.unit_cost}
              onChange={e =>
                handleSpareUnitCostChange(rowIndex, e.target.value)
              }
            />
          ) : (
            <span className="text-gray-600">
              {formatCurrency(row.unit_cost)}
            </span>
          ),
      },
      {
        id: 'total',
        label: 'Total',
        width: 140,
        numeric: true,
        render: (_value, row) => (
          <span className="font-semibold text-gray-900">
            {formatCurrency((row.quantity || 1) * (row.unit_cost || 0))}
          </span>
        ),
      },
      ...(currentStatus !== 'closed'
        ? [
            {
              id: 'actions',
              label: '',
              width: 60,
              sortable: false,
              render: (_value: unknown, _row: SpareRow, rowIndex: number) => (
                <div className="flex items-center justify-end">
                  <DeleteButton
                    onClick={() => handleRemoveSpare(rowIndex)}
                    tooltip="Remove"
                  />
                </div>
              ),
            },
          ]
        : []),
    ],
    [currentStatus, formatCurrency, isEdit]
  );

  const handleOpenCooler360 = () => {
    if (!activeTicket?.asset_id) return;
    handleCancel();
    navigate(`/transactions/cooler-360/${activeTicket.asset_id}`);
  };

  return (
    <>
      <CustomDrawer
        open={drawerOpen}
        setOpen={handleCancel}
        title={
          isEdit
            ? activeTicket?.job_number || `Job #${activeTicket?.id || ''}`
            : 'Create Asset Maintenance'
        }
        size="large"
      >
        <Box className="!p-5 !space-y-5">
          {isEdit && activeTicket ? (
            isDetailsLoading ? (
              <MaintenanceDrawerSkeleton />
            ) : (
              <Box className="!space-y-4">
                {/* <Box className="!flex !items-center !gap-2 !flex-wrap">
                  <Chip
                    label={formatStageLabel(currentStatus)}
                    size="small"
                    color={getStageChipColor(currentStatus)}
                    className="!font-semibold"
                  />
                  {activeTicket.is_overdue && currentStatus !== 'closed' && (
                    <Chip
                      label="Overdue"
                      size="small"
                      color="error"
                      className="!font-semibold"
                    />
                  )}
                  {(isUnderWarranty || hasWarrantyClaim) && (
                    <Chip
                      label="Under warranty"
                      size="small"
                      color="info"
                      variant="outlined"
                      className="!font-semibold"
                    />
                  )}
                </Box> */}

                <Box className="!bg-white !border !border-gray-200 !rounded-lg !p-4 !shadow-sm">
                  <Stepper activeStep={stageIndex}>
                    {stages.map((stg, idx) => {
                      const isPassed =
                        idx < stageIndex || currentStatus === 'closed';
                      const isCurrent =
                        idx === stageIndex && currentStatus !== 'closed';
                      return (
                        <Step key={stg} completed={isPassed}>
                          <StepLabel
                            StepIconComponent={() => null}
                            className="[&_.MuiStepLabel-iconContainer]:!hidden"
                          >
                            <Chip
                              label={formatStageLabel(stg)}
                              size="small"
                              color={
                                isCurrent
                                  ? 'primary'
                                  : isPassed
                                    ? 'success'
                                    : 'default'
                              }
                              variant={isCurrent ? 'filled' : 'outlined'}
                              className="!font-semibold cursor-default"
                            />
                          </StepLabel>
                        </Step>
                      );
                    })}
                  </Stepper>
                </Box>

                {(isUnderWarranty || hasWarrantyClaim) && (
                  <Alert
                    severity="info"
                    icon={<Shield size={18} className="text-teal-700 mt-0.5" />}
                    className="!bg-teal-50/80 !text-teal-900 !border !border-teal-200 !rounded-lg"
                  >
                    <Typography
                      variant="caption"
                      className="!text-xs !text-teal-900 !block"
                    >
                      {isUnderWarranty && warrantyExpiry ? (
                        <>
                          <strong>
                            Under warranty until {formatDate(warrantyExpiry)}.
                          </strong>{' '}
                          Parts can be claimed from the supplier.
                        </>
                      ) : (
                        <strong>
                          Warranty claim flagged for supplier parts.
                        </strong>
                      )}
                    </Typography>
                    {currentStatus !== 'closed' ? (
                      <Box className="!mt-2 !bg-white !border !border-teal-200 !rounded-md !px-3 !py-0.5 !inline-block">
                        <FormControlLabel
                          control={
                            <Checkbox
                              size="small"
                              checked={hasWarrantyClaim}
                              disabled={
                                updateAssetMaintenanceMutation.isPending
                              }
                              onChange={e =>
                                handleToggleWarrantyClaim(e.target.checked)
                              }
                            />
                          }
                          label={
                            <Typography
                              variant="caption"
                              className="!text-xs !font-medium !text-teal-950"
                            >
                              Raise warranty claim for parts
                            </Typography>
                          }
                          className="!m-0"
                        />
                      </Box>
                    ) : (
                      hasWarrantyClaim && (
                        <Typography
                          variant="caption"
                          className="!text-xs !font-semibold !text-teal-800 !block !mt-1"
                        >
                          Claim raised for supplier parts.
                        </Typography>
                      )
                    )}
                  </Alert>
                )}

                {activeTicket.is_overdue && currentStatus !== 'closed' && (
                  <Alert
                    severity="warning"
                    icon={<Clock size={18} className="mt-0.5" />}
                    className="!border !border-amber-200 !rounded-lg"
                  >
                    <Typography
                      variant="body2"
                      className="!text-sm !font-semibold !text-amber-900"
                    >
                      Overdue since{' '}
                      {activeTicket.due_date
                        ? formatDate(activeTicket.due_date)
                        : 'due date'}
                    </Typography>
                    <Typography
                      variant="caption"
                      className="!text-xs !text-amber-800 !block"
                    >
                      Escalated to the Area Maintenance Manager. Reassign or set
                      a new due date.
                    </Typography>
                  </Alert>
                )}

                {activeTicket.replace_review_needed && (
                  <Alert
                    severity="error"
                    icon={<Flag size={18} className="mt-0.5" />}
                    className="!border !border-rose-200 !rounded-lg"
                  >
                    <Typography
                      variant="body2"
                      className="!text-sm !font-semibold !text-rose-900"
                    >
                      Replace-or-repair review
                    </Typography>
                    <Typography
                      variant="caption"
                      className="!text-xs !text-rose-800 !block"
                    >
                      {activeTicket.replace_review?.message ||
                        `${activeTicket.repairs_last_90_days || 2} repair jobs in 90 days. Consider replacing instead of repairing again.`}
                    </Typography>
                  </Alert>
                )}

                <Box className="!bg-slate-50 !p-4 !rounded-lg !border !border-gray-200 !shadow-sm !grid !grid-cols-1 md:!grid-cols-2 !gap-x-6 !gap-y-3">
                  <Box>
                    <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold block">
                      Cooler
                    </span>
                    <button
                      type="button"
                      onClick={handleOpenCooler360}
                      className="font-semibold text-primary-600 hover:underline text-sm text-left"
                    >
                      {coolerTitle}
                    </button>
                  </Box>
                  <Box>
                    <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold block">
                      Current Location
                    </span>
                    <Typography
                      variant="body2"
                      className="!font-semibold !text-gray-900 !text-sm"
                    >
                      {outletInfo}
                    </Typography>
                  </Box>
                  <Box>
                    <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold block">
                      Issue Reported
                    </span>
                    <Typography
                      variant="caption"
                      className="!text-gray-700 !text-xs !block !mt-0.5"
                    >
                      {activeTicket.issue_reported ||
                        'No issue description recorded'}
                    </Typography>
                  </Box>
                  <Box>
                    <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold block">
                      Repair At
                    </span>
                    <Typography
                      variant="caption"
                      className="!text-gray-700 !text-xs !block !mt-0.5 capitalize"
                    >
                      {activeTicket.repair_location ||
                        'To be decided by technician'}
                    </Typography>
                  </Box>
                  <Box>
                    <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold block">
                      Source
                    </span>
                    <Typography
                      variant="caption"
                      className="!text-gray-700 !text-xs !block !mt-0.5"
                    >
                      {activeTicket.source_type
                        ? `${activeTicket.source_type.toUpperCase()} ${activeTicket.source_code || ''} · ${activeTicket.asset_maintenance_technician?.name || 'System'}`
                        : `Inspection · ${activeTicket.asset_maintenance_technician?.name || 'System'}`}
                    </Typography>
                  </Box>
                  <Box>
                    <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold block">
                      Raised
                    </span>
                    <Typography
                      variant="caption"
                      className="!text-gray-700 !text-xs !block !mt-0.5"
                    >
                      {activeTicket.maintenance_date
                        ? formatDateTime(activeTicket.maintenance_date)
                        : 'Recently'}
                    </Typography>
                  </Box>
                  {activeTicket.secondary_source_code && (
                    <Box className="col-span-1 md:col-span-2">
                      <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold block">
                        Also Reported By
                      </span>
                      <Typography
                        variant="caption"
                        className="!text-gray-700 !text-xs !block !mt-0.5"
                      >
                        {activeTicket.secondary_source_code}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {currentStatus !== 'closed' && (
                  <Box className="!bg-white !p-4 !rounded-lg !border !border-gray-200 !shadow-sm !space-y-3">
                    <Typography
                      variant="subtitle2"
                      className="!text-sm !font-bold !text-gray-900"
                    >
                      {activeTicket.technician_id
                        ? 'Assignment'
                        : 'Assign technician'}
                    </Typography>
                    <Box className="!grid !grid-cols-1 md:!grid-cols-3 !gap-3">
                      <UserSelect
                        name="assigned_technician"
                        label="Technician"
                        value={
                          assignedTechId ? Number(assignedTechId) : undefined
                        }
                        onChange={(_event, user) =>
                          setAssignedTechId(user?.id || '')
                        }
                        nameToSearch={
                          activeTicket.asset_maintenance_technician?.name
                        }
                        required
                      />

                      <Select
                        label="Priority"
                        value={ticketPriority}
                        disableClearable
                        onChange={e =>
                          handlePriorityChange(
                            String(e.target.value || 'medium')
                          )
                        }
                      >
                        <MenuItem value="low">Low (10 days)</MenuItem>
                        <MenuItem value="medium">Medium (5 days)</MenuItem>
                        <MenuItem value="high">High (2 days)</MenuItem>
                      </Select>

                      <Input
                        label="Due Date"
                        type="date"
                        value={ticketDueDate}
                        onChange={e => setTicketDueDate(e.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                      />
                    </Box>

                    <Typography
                      variant="caption"
                      className="!text-gray-400 !block !text-[11px]"
                    >
                      Due date fills from priority: High 2 days, Medium 5, Low
                      10. Past due jobs are escalated automatically.
                    </Typography>

                    <Box className="!flex !items-center !gap-3 !pt-1">
                      <Button
                        type="button"
                        variant={
                          activeTicket.technician_id ? 'outlined' : 'contained'
                        }
                        size="small"
                        onClick={handleUpdateAssignment}
                        disabled={
                          assignTechnicianMutation.isPending || !assignedTechId
                        }
                      >
                        {assignTechnicianMutation.isPending
                          ? 'Updating...'
                          : activeTicket.technician_id
                            ? 'Update assignment'
                            : 'Assign'}
                      </Button>
                      {activeTicket.asset_maintenance_technician?.name && (
                        <Typography
                          variant="caption"
                          className="!text-xs !text-gray-500"
                        >
                          Assigned to{' '}
                          {activeTicket.asset_maintenance_technician.name}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}

                {isWorkshop &&
                  (currentStatus === 'awaiting_return' ? (
                    <Box className="!p-4 !rounded-lg !bg-amber-50/80 !border !border-amber-200 !space-y-2.5">
                      <Box>
                        <Typography
                          variant="subtitle2"
                          className="!text-sm !font-bold !text-gray-900"
                        >
                          Cooler is still at {originalOutlet?.name || 'Outlet'}
                        </Typography>
                        <Typography
                          variant="caption"
                          className="!text-xs !text-gray-600 !block !mt-1"
                        >
                          Logistics: create the Return movement. The cooler then
                          counts as at {workshopDepot?.name || 'Depot'} and
                          becomes Under repair.
                        </Typography>
                      </Box>
                      <Button
                        type="button"
                        variant="contained"
                        size="small"
                        startIcon={<Truck size={15} />}
                        onClick={() =>
                          setReturnModalState({ open: true, mode: 'return' })
                        }
                      >
                        Create return movement
                      </Button>
                    </Box>
                  ) : (
                    <Box className="!p-4 !rounded-lg !bg-purple-50/80 !border !border-purple-200 !space-y-2 !text-xs">
                      <Box className="!flex !items-center !gap-2 !font-semibold !text-purple-900">
                        <Truck size={15} className="shrink-0" />
                        <span>
                          Returned to{' '}
                          {workshopReturnInfo?.depot_name ||
                            workshopDepot?.name ||
                            'Depot'}
                          {workshopReturnInfo?.return_movement_code
                            ? ` by ${workshopReturnInfo.return_movement_code}`
                            : ''}
                          . Asset status:{' '}
                          {activeTicket.asset_maintenance_master
                            ?.current_status || 'Under repair'}
                          .
                        </span>
                      </Box>
                      {workshopReturnInfo?.standby_serial ? (
                        <Typography
                          variant="caption"
                          className="!text-purple-800 !block !pl-6"
                        >
                          Standby cooler {workshopReturnInfo.standby_serial}{' '}
                          installed at{' '}
                          {workshopReturnInfo.from_customer_name ||
                            originalOutlet?.name ||
                            'Outlet'}
                          {workshopReturnInfo.standby_movement_code
                            ? ` (${workshopReturnInfo.standby_movement_code})`
                            : ''}
                          .
                        </Typography>
                      ) : (
                        currentStatus !== 'closed' &&
                        Boolean(originalOutlet?.id) &&
                        activeTicket.outlet_has_cooler === false && (
                          <Box className="!pl-6 !space-y-2">
                            <Typography
                              variant="caption"
                              className="!text-purple-900 !block !font-semibold"
                            >
                              {originalOutlet?.name} currently has no active
                              cooler.
                            </Typography>
                            <Button
                              type="button"
                              variant="outlined"
                              size="small"
                              startIcon={<Add fontSize="small" />}
                              onClick={() =>
                                setReturnModalState({
                                  open: true,
                                  mode: 'standby',
                                })
                              }
                            >
                              Install standby cooler
                            </Button>
                          </Box>
                        )
                      )}
                    </Box>
                  ))}

                {(currentStatus === 'repaired' ||
                  currentStatus === 'closed' ||
                  activeTicket.action_taken) && (
                  <Box className="!bg-white !p-4 !rounded-lg !border !border-gray-200 !shadow-sm !space-y-3">
                    <Typography
                      variant="subtitle2"
                      className="!text-sm !font-bold !text-gray-900"
                    >
                      Repair result (from mobile)
                    </Typography>
                    <Box className="!grid !grid-cols-2 !gap-3 !text-xs">
                      <Box>
                        <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold block">
                          Action Taken
                        </span>
                        <Typography
                          variant="caption"
                          className="!font-semibold !text-gray-800 !block !mt-0.5"
                        >
                          {activeTicket.action_taken || 'Replaced parts'}
                        </Typography>
                      </Box>
                      <Box>
                        <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold block">
                          Status After Repair
                        </span>
                        <Typography
                          variant="caption"
                          className="!font-semibold !text-emerald-700 !block !mt-0.5 capitalize"
                        >
                          {activeTicket.status_after_repair || 'Working'}
                        </Typography>
                      </Box>
                      <Box>
                        <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold block">
                          Done By
                        </span>
                        <Typography
                          variant="caption"
                          className="!text-gray-700 !block !mt-0.5"
                        >
                          {activeTicket.asset_maintenance_technician?.name ||
                            'Technician'}
                        </Typography>
                      </Box>
                      <Box>
                        <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold block">
                          Photos
                        </span>
                        <Typography
                          variant="caption"
                          className="!text-gray-700 !block !mt-0.5"
                        >
                          {Array.isArray(activeTicket.repair_photos)
                            ? activeTicket.repair_photos.length
                            : 0}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}

                <Box className="!bg-white !rounded-lg !border !border-gray-200 !shadow-sm !space-y-3">
                  <Table
                    data={sparesList}
                    compact
                    actions={
                      <div className="flex justify-between items-center w-full">
                        <Typography
                          variant="subtitle2"
                          className="!text-sm !font-bold !text-gray-900"
                        >
                          Spares and cost
                        </Typography>
                        {sparesList.length > 0 && (
                          <span className="text-xs text-gray-500">
                            {sparesList.length}{' '}
                            {sparesList.length === 1 ? 'part' : 'parts'}
                          </span>
                        )}
                      </div>
                    }
                    filterColunm={false}
                    sortable={false}
                    columns={spareColumns}
                    getRowId={(item, idx) => item.tempId || `sp_${idx}`}
                    pagination={false}
                    emptyMessage="No spare parts added"
                    footer={
                      <Box className="!border-t !border-gray-200 !bg-slate-50 !px-4 !py-2.5 !space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-gray-800">
                            Total:
                          </span>
                          <span className="text-sm font-bold text-primary-600">
                            {formatCurrency(totalTicketCost)}
                          </span>
                        </div>
                        {hasWarrantyClaim && sparesTotalCost > 0 && (
                          <Typography
                            variant="caption"
                            className="!text-[11px] !text-teal-700 !block"
                          >
                            Parts {formatCurrency(sparesTotalCost)} claimed
                            under warranty from supplier
                          </Typography>
                        )}
                      </Box>
                    }
                  />

                  {currentStatus !== 'closed' && (
                    <Box className="!space-y-3 !px-3">
                      <Box className="!grid !grid-cols-1 md:!grid-cols-4 !gap-2 !items-center">
                        <Box className="md:col-span-2">
                          <Input
                            placeholder="Part (typed for now) e.g. Fan motor 12V"
                            size="small"
                            value={newPartName}
                            onChange={e => setNewPartName(e.target.value)}
                          />
                        </Box>
                        <Input
                          placeholder="Qty"
                          type="number"
                          size="small"
                          value={newPartQty}
                          onChange={e =>
                            setNewPartQty(Math.max(1, Number(e.target.value)))
                          }
                        />
                        <Input
                          placeholder="Unit cost (TZS)"
                          type="number"
                          size="small"
                          value={newPartUnitCost}
                          onChange={e =>
                            setNewPartUnitCost(e.target.value.replace(/-/g, ''))
                          }
                        />
                      </Box>

                      <Box className="!flex !items-center !gap-3 !flex-wrap">
                        <Button
                          type="button"
                          variant="outlined"
                          size="small"
                          onClick={handleAddSparePart}
                          startIcon={<Add fontSize="small" />}
                        >
                          Add part
                        </Button>
                        <Button
                          type="button"
                          variant={hasSpareChanges ? 'contained' : 'outlined'}
                          size="small"
                          onClick={handleUpdateSpares}
                          disabled={
                            updateAssetMaintenanceMutation.isPending ||
                            !hasSpareChanges
                          }
                        >
                          {updateAssetMaintenanceMutation.isPending
                            ? 'Updating...'
                            : 'Update parts'}
                        </Button>
                        {hasSpareChanges && (
                          <Typography
                            variant="caption"
                            className="!text-xs !text-amber-600 !font-medium"
                          >
                            Unsaved spare part changes
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}

                  {currentStatus === 'closed' ? (
                    <Box className="!px-3 !pb-3">
                      <Alert severity="success" className="!text-xs">
                        <Box className="!space-y-1.5">
                          <div>
                            Closed. {formatCurrency(totalTicketCost)} saved to
                            Asset Maintenance cost.
                            {isWorkshop && isAtDepot
                              ? activeTicket.asset_maintenance_master?.current_status?.toLowerCase() ===
                                  'damaged' ||
                                activeTicket.status_after_repair?.toLowerCase() ===
                                  'damaged'
                                ? ` Cooler is marked Damaged at ${workshopDepot?.name || 'Depot'}.`
                                : ` Cooler is Available at ${workshopDepot?.name || 'Depot'}; redeploy it from Asset Movement.`
                              : ''}
                          </div>

                          {isWorkshop &&
                            isAtDepot &&
                            workshopReturnInfo?.standby_serial &&
                            (workshopReturnInfo.standby_returned ? (
                              <Typography
                                variant="caption"
                                className="!block !text-emerald-800"
                              >
                                Standby cooler{' '}
                                {workshopReturnInfo.standby_serial} returned to
                                depot (
                                {
                                  workshopReturnInfo.standby_returned_movement_code
                                }
                                ).
                              </Typography>
                            ) : (
                              <Typography
                                variant="caption"
                                className="!block !text-amber-800"
                              >
                                Standby cooler{' '}
                                {workshopReturnInfo.standby_serial} is currently
                                installed at {originalOutlet?.name || 'Outlet'}.
                                Deploy this cooler to another outlet, or return
                                the standby first before reinstalling at{' '}
                                {originalOutlet?.name || 'Outlet'}.
                              </Typography>
                            ))}

                          {isWorkshop &&
                            isAtDepot &&
                            activeTicket.asset_maintenance_master?.current_status?.toLowerCase() !==
                              'damaged' &&
                            activeTicket.status_after_repair?.toLowerCase() !==
                              'damaged' && (
                              <Box className="!flex !items-center !gap-2 !pt-1 !flex-wrap">
                                <Button
                                  type="button"
                                  variant="contained"
                                  size="small"
                                  startIcon={<Truck size={14} />}
                                  onClick={() => {
                                    setReturnModalState({
                                      open: true,
                                      mode: 'redeploy',
                                    });
                                  }}
                                >
                                  Redeploy Cooler
                                </Button>

                                {workshopReturnInfo?.standby_asset_id &&
                                  !workshopReturnInfo?.standby_returned &&
                                  Boolean(
                                    workshopReturnInfo.from_customer_id ||
                                    originalOutlet?.id
                                  ) && (
                                    <Button
                                      type="button"
                                      variant="outlined"
                                      size="small"
                                      onClick={() => {
                                        setReturnModalState({
                                          open: true,
                                          mode: 'return_standby',
                                        });
                                      }}
                                    >
                                      Return Standby (
                                      {workshopReturnInfo.standby_serial ||
                                        'Cooler'}
                                      )
                                    </Button>
                                  )}
                              </Box>
                            )}
                        </Box>
                      </Alert>
                    </Box>
                  ) : (
                    <Box className="!flex !justify-end !flex-col !items-end !px-3 !gap-1 !pb-3">
                      <Button
                        type="button"
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={handleCloseJob}
                        disabled={
                          closeJobMutation.isPending ||
                          currentStatus !== 'repaired'
                        }
                        startIcon={<CheckCircle size={16} />}
                        className="!w-full md:!w-auto !bg-emerald-600 hover:!bg-emerald-700"
                      >
                        {closeJobMutation.isPending
                          ? 'Closing...'
                          : 'Close Ticket'}
                      </Button>
                      {currentStatus !== 'repaired' && (
                        <Typography
                          variant="caption"
                          className="!text-gray-400 !block !text-[11px]"
                        >
                          You can close once the technician marks the job done
                          on mobile.
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>

                <Box className="!bg-white !p-4 !rounded-lg !border !border-gray-200 !shadow-sm !space-y-2">
                  <Typography
                    variant="subtitle2"
                    className="!text-sm !font-bold !text-gray-900"
                  >
                    Status history
                  </Typography>
                  <Box className="!space-y-2 !text-xs">
                    {(activeTicket.activities || []).length > 0 ? (
                      activeTicket.activities?.map(act => (
                        <Box
                          key={act.id}
                          className="!flex !items-start !justify-between !py-1 !border-b !border-gray-100 last:!border-0"
                        >
                          <Box>
                            <span className="font-semibold text-gray-900 capitalize">
                              {act.title || act.status}
                            </span>
                            <span className="text-gray-500">
                              {' '}
                              · {act.asset_activities_user?.name || 'System'}
                            </span>
                            {act.description && (
                              <Typography
                                variant="caption"
                                className="!text-gray-500 !text-[11px] !block !mt-0.5"
                              >
                                {act.description}
                              </Typography>
                            )}
                          </Box>
                          <span className="text-gray-400 text-[11px] shrink-0 ml-2">
                            {formatDate(act.created_at)}
                          </span>
                        </Box>
                      ))
                    ) : (
                      <Box className="!space-y-1.5 !text-gray-600">
                        <div>
                          {formatDate(activeTicket.maintenance_date)} · Open ·
                          System
                        </div>
                        {activeTicket.technician_id && (
                          <div>
                            Assigned ·{' '}
                            {activeTicket.asset_maintenance_technician?.name ||
                              'Technician'}
                          </div>
                        )}
                        {currentStatus === 'repaired' && (
                          <div>
                            Repaired ·{' '}
                            {activeTicket.asset_maintenance_technician?.name ||
                              'Technician'}
                          </div>
                        )}
                        {currentStatus === 'closed' && (
                          <div>Closed · Supervisor</div>
                        )}
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            )
          ) : (
            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
                <AssetSelect
                  name="asset_id"
                  label="Asset / Cooler"
                  formik={formik}
                  required
                />

                <UserSelect
                  name="technician_id"
                  label="Technician"
                  formik={formik}
                />

                <Input
                  name="maintenance_date"
                  label="Maintenance Date"
                  type="date"
                  formik={formik}
                  required
                  slotProps={{ inputLabel: { shrink: true } }}
                />

                <Select
                  name="priority"
                  label="Priority"
                  value={formik.values.priority}
                  disableClearable
                  onChange={e =>
                    formik.setFieldValue('priority', String(e.target.value))
                  }
                >
                  <MenuItem value="low">Low (10 days)</MenuItem>
                  <MenuItem value="medium">Medium (5 days)</MenuItem>
                  <MenuItem value="high">High (2 days)</MenuItem>
                </Select>

                <Select
                  name="repair_location"
                  label="Repair Location"
                  value={formik.values.repair_location}
                  disableClearable
                  onChange={e =>
                    formik.setFieldValue(
                      'repair_location',
                      String(e.target.value)
                    )
                  }
                >
                  <MenuItem value="onsite">On Site</MenuItem>
                  <MenuItem value="workshop">Workshop</MenuItem>
                </Select>

                <Input
                  name="cost"
                  label="Estimated Cost (TZS)"
                  type="number"
                  placeholder="Enter estimated cost"
                  formik={formik}
                  onChange={e => {
                    const sanitized = e.target.value.replace(/-/g, '');
                    formik.setFieldValue('cost', sanitized);
                  }}
                />
              </Box>

              <Input
                name="issue_reported"
                label="Issue Reported"
                placeholder="Describe the issue that was reported"
                formik={formik}
                multiline
                rows={3}
                required
              />

              <Input
                name="remarks"
                label="Remarks"
                placeholder="Enter additional remarks"
                formik={formik}
                multiline
                rows={2}
              />

              <Box className="!space-y-3 !pt-1">
                <Box className="!flex !justify-between !items-center">
                  <Typography
                    variant="subtitle2"
                    className="!text-sm !font-semibold !text-gray-900"
                  >
                    Spare Parts (Optional)
                  </Typography>
                  {sparesList.length > 0 && (
                    <span className="text-xs text-gray-500">
                      Total: {formatCurrency(sparesTotalCost)}
                    </span>
                  )}
                </Box>

                <Table
                  data={sparesList}
                  compact
                  filterColunm={false}
                  sortable={false}
                  columns={spareColumns}
                  getRowId={(item, idx) => item.tempId || `sp_${idx}`}
                  pagination={false}
                  emptyMessage="No spare parts added"
                  footer={
                    sparesList.length > 0 ? (
                      <div className="flex justify-between items-center px-4 py-2.5 border-t border-gray-200 bg-slate-50">
                        <span className="text-xs font-semibold text-gray-800">
                          Total Spares Cost:
                        </span>
                        <span className="text-sm font-bold text-primary-600">
                          {formatCurrency(sparesTotalCost)}
                        </span>
                      </div>
                    ) : undefined
                  }
                />

                <Box className="!space-y-3 !pt-2">
                  <Box className="!grid !grid-cols-1 md:!grid-cols-4 !gap-2 !items-center">
                    <Box className="md:col-span-2">
                      <Input
                        placeholder="Part name e.g. Fan motor 12V"
                        size="small"
                        value={newPartName}
                        onChange={e => setNewPartName(e.target.value)}
                      />
                    </Box>
                    <Input
                      placeholder="Qty"
                      type="number"
                      size="small"
                      value={newPartQty}
                      onChange={e =>
                        setNewPartQty(Math.max(1, Number(e.target.value)))
                      }
                    />
                    <Input
                      placeholder="Unit cost (TZS)"
                      type="number"
                      size="small"
                      value={newPartUnitCost}
                      onChange={e =>
                        setNewPartUnitCost(e.target.value.replace(/-/g, ''))
                      }
                    />
                  </Box>
                  <Button
                    type="button"
                    variant="outlined"
                    size="small"
                    onClick={handleAddSparePart}
                    startIcon={<Add fontSize="small" />}
                  >
                    Add part
                  </Button>
                </Box>
              </Box>

              <ActiveInactiveField name="is_active" formik={formik} required />

              <Box className="!flex !justify-end !gap-3 !pt-2">
                <Button
                  type="button"
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={createAssetMaintenanceMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={createAssetMaintenanceMutation.isPending}
                >
                  {createAssetMaintenanceMutation.isPending
                    ? 'Creating...'
                    : 'Create'}
                </Button>
              </Box>
            </form>
          )}
        </Box>
      </CustomDrawer>

      {isEdit && activeTicket && (
        <WorkshopReturnModal
          open={returnModalState.open}
          mode={returnModalState.mode}
          onClose={() => setReturnModalState({ open: false, mode: 'return' })}
          ticket={activeTicket}
          onSuccess={refetchDetails}
        />
      )}
    </>
  );
};

export default ManageAssetMaintenance;
