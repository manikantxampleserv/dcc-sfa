import { Close } from '@mui/icons-material';
import {
  Alert,
  Box,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  Typography,
} from '@mui/material';
import { useAuth } from 'context/AuthContext';
import { useAssetMaster, type AssetMaster } from 'hooks/useAssetMaster';
import {
  useCreateWorkshopReturn,
  useInstallStandbyCooler,
  type AssetMaintenance,
} from 'hooks/useAssetMaintenance';
import { useCreateAssetMovement } from 'hooks/useAssetMovement';
import { useCustomersDropdown } from 'hooks/useCustomers';
import { useDepots } from 'hooks/useDepots';
import React, { useEffect, useMemo, useState } from 'react';
import Button from 'shared/Button';
import Input from 'shared/Input';
import Select from 'shared/Select';
import { formatForDateInput } from 'utils/dateUtils';
import { formatCoolerTitle, resolveTicketLocations } from './ticketHelpers';

export type WorkshopModalMode =
  | 'return'
  | 'standby'
  | 'redeploy'
  | 'return_standby';

interface WorkshopReturnModalProps {
  open: boolean;
  mode?: WorkshopModalMode;
  onClose: () => void;
  ticket: AssetMaintenance;
  onSuccess?: () => Promise<unknown> | void;
}

/**
 * Unified dialog modal for workshop movements:
 * - return: Workshop return movement with optional standby cooler
 * - standby: Install standby cooler for an already-returned ticket
 * - redeploy: Redeploy repaired cooler back to outlet upon job completion
 * - return_standby: Return standby cooler to depot upon job completion
 *
 * Built with DCC-SFA shared controls, avoiding external drawer navigation.
 *
 * @param {WorkshopReturnModalProps} props Modal props.
 * @returns {React.ReactElement} Workshop movement dialog.
 */
const WorkshopReturnModal: React.FC<WorkshopReturnModalProps> = ({
  open,
  mode = 'return',
  onClose,
  ticket,
  onSuccess,
}) => {
  const { user } = useAuth();
  const isStandbyOnly = mode === 'standby';
  const isRedeploy = mode === 'redeploy';
  const isReturnStandby = mode === 'return_standby';

  const { originalOutlet, workshopDepot, workshopReturnInfo } = useMemo(
    () => resolveTicketLocations(ticket),
    [ticket]
  );
  const coolerTitle = useMemo(
    () => formatCoolerTitle(ticket.asset_maintenance_master),
    [ticket.asset_maintenance_master]
  );
  const jobNumber = ticket.job_number || `MT-${String(ticket.id).padStart(5, '0')}`;
  const standbySerial =
    workshopReturnInfo?.standby_serial || 'Standby Cooler';
  const hasActiveStandby = Boolean(
    workshopReturnInfo?.standby_serial && !workshopReturnInfo?.standby_returned
  );

  const [movementDate, setMovementDate] = useState<string>(() =>
    formatForDateInput(new Date().toISOString())
  );
  const [toDepotId, setToDepotId] = useState<string>('');
  const [targetCustomerId, setTargetCustomerId] = useState<string>('');
  const [installStandby, setInstallStandby] = useState<boolean>(true);
  const [standbyAssetId, setStandbyAssetId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const createWorkshopReturnMutation = useCreateWorkshopReturn();
  const installStandbyMutation = useInstallStandbyCooler();
  const createAssetMovementMutation = useCreateAssetMovement();

  const { data: depotsResponse, isFetching: isDepotsLoading } = useDepots(
    {
      page: 1,
      limit: 100,
      isActive: 'Y',
    },
    {
      enabled: open,
    }
  );

  const depotOptions = useMemo(() => {
    const apiDepots = (depotsResponse?.data || []).map(d => ({
      id: d.id,
      name: d.name,
    }));
    if (
      workshopDepot?.id &&
      workshopDepot.name &&
      !apiDepots.some(d => d.id === workshopDepot.id)
    ) {
      return [
        { id: workshopDepot.id, name: workshopDepot.name },
        ...apiDepots,
      ];
    }
    return apiDepots;
  }, [depotsResponse?.data, workshopDepot]);

  const selectedDepotName = useMemo(() => {
    const matched = depotOptions.find(d => String(d.id) === String(toDepotId));
    return matched?.name || workshopDepot?.name || 'Depot';
  }, [depotOptions, toDepotId, workshopDepot]);

  const defaultWorkshopDepotId =
    workshopDepot?.id ||
    originalOutlet?.depot_id ||
    ticket.asset_maintenance_master?.depot_id ||
    '';

  const { data: customersResponse, isFetching: isCustomersLoading } =
    useCustomersDropdown(
      {
        depot_id: toDepotId ? Number(toDepotId) : undefined,
        limit: 100,
      },
      {
        enabled: open && isRedeploy,
      }
    );

  const customerOptions = useMemo(() => {
    const apiCustomers = (customersResponse?.data || []).map(c => ({
      id: c.id,
      name: c.name,
      code: c.code,
    }));
    if (
      originalOutlet?.id &&
      originalOutlet.name &&
      !apiCustomers.some(c => c.id === Number(originalOutlet.id))
    ) {
      return [
        {
          id: Number(originalOutlet.id),
          name: originalOutlet.name,
          code:
            (originalOutlet as { code?: string | null }).code || '',
        },
        ...apiCustomers,
      ];
    }
    return apiCustomers;
  }, [customersResponse?.data, originalOutlet]);

  const selectedCustomerName = useMemo(() => {
    const matched = customerOptions.find(
      c => String(c.id) === String(targetCustomerId)
    );
    return matched?.name || originalOutlet?.name || 'Outlet';
  }, [customerOptions, targetCustomerId, originalOutlet]);

  useEffect(() => {
    if (!open) return;
    setMovementDate(formatForDateInput(new Date().toISOString()));
    setToDepotId(defaultWorkshopDepotId ? String(defaultWorkshopDepotId) : '');
    setInstallStandby(Boolean(originalOutlet?.id));
    setStandbyAssetId('');
    setTargetCustomerId(originalOutlet?.id ? String(originalOutlet.id) : '');

    if (isRedeploy) {
      setNotes(`Redeploying repaired cooler after job ${jobNumber}`);
    } else if (isReturnStandby) {
      setNotes(
        `Returning standby cooler ${workshopReturnInfo?.standby_serial || ''} after job ${jobNumber}`
      );
    } else {
      setNotes('');
    }
  }, [
    open,
    ticket.id,
    defaultWorkshopDepotId,
    originalOutlet?.id,
    isRedeploy,
    isReturnStandby,
    jobNumber,
    workshopReturnInfo?.standby_serial,
  ]);

  useEffect(() => {
    if (!open || toDepotId || depotOptions.length === 0) return;
    const fallbackId =
      workshopDepot?.id || originalOutlet?.depot_id || depotOptions[0]?.id;
    if (fallbackId) {
      setToDepotId(String(fallbackId));
    }
  }, [open, toDepotId, depotOptions, workshopDepot, originalOutlet]);

  const { data: standbyAssetsResponse, isFetching: isStandbyLoading } =
    useAssetMaster(
      {
        depot_id: toDepotId ? Number(toDepotId) : undefined,
        only_available: true,
        current_status: 'Available',
        status: 'active',
        limit: 100,
      },
      {
        enabled: open && Boolean(toDepotId) && (mode === 'return' || mode === 'standby'),
      }
    );

  const standbyCandidates: AssetMaster[] = useMemo(() => {
    const rows: AssetMaster[] = standbyAssetsResponse?.data || [];
    return rows.filter(a => a.id !== ticket.asset_id);
  }, [standbyAssetsResponse?.data, ticket.asset_id]);

  const selectedStandbyAsset = useMemo(
    () =>
      standbyCandidates.find(a => String(a.id) === String(standbyAssetId)) ||
      standbyCandidates[0] ||
      null,
    [standbyCandidates, standbyAssetId]
  );

  useEffect(() => {
    if (!open || (!isStandbyOnly && !installStandby)) return;
    if (standbyCandidates.length === 0) {
      setStandbyAssetId('');
      return;
    }
    const exists = standbyCandidates.some(
      a => String(a.id) === String(standbyAssetId)
    );
    if (!exists) {
      setStandbyAssetId(String(standbyCandidates[0].id));
    }
  }, [open, isStandbyOnly, installStandby, standbyCandidates, standbyAssetId]);

  const isPending =
    createWorkshopReturnMutation.isPending ||
    installStandbyMutation.isPending ||
    createAssetMovementMutation.isPending;

  const handleSubmit = async () => {
    if (isStandbyOnly) {
      if (!standbyAssetId || !toDepotId) return;
      try {
        await installStandbyMutation.mutateAsync({
          id: ticket.id,
          data: {
            depot_id: Number(toDepotId),
            standby_asset_id: Number(standbyAssetId),
            movement_date: movementDate || undefined,
          },
        });
        onClose();
        await onSuccess?.();
      } catch (error) {
        console.error('Failed to install standby cooler:', error);
      }
      return;
    }

    if (isRedeploy) {
      const targetCustId = Number(targetCustomerId || originalOutlet?.id);
      if (!toDepotId || !targetCustId) return;
      try {
        await createAssetMovementMutation.mutateAsync({
          asset_ids: [ticket.asset_id],
          movement_type: 'installation',
          from_direction: 'depot',
          from_depot_id: Number(toDepotId),
          to_direction: 'outlet',
          to_customer_id: targetCustId,
          movement_date: movementDate || new Date().toISOString(),
          performed_by: user?.id || 1,
          notes:
            notes.trim() || `Redeploying repaired cooler after job ${jobNumber}`,
        });
        onClose();
        await onSuccess?.();
      } catch (error) {
        console.error('Failed to redeploy repaired cooler:', error);
      }
      return;
    }

    if (isReturnStandby) {
      const standbyId = Number(workshopReturnInfo?.standby_asset_id);
      const fromCustId = Number(
        workshopReturnInfo?.from_customer_id || originalOutlet?.id
      );
      if (!toDepotId || !standbyId || !fromCustId) return;
      try {
        await createAssetMovementMutation.mutateAsync({
          asset_ids: [standbyId],
          movement_type: 'return',
          from_direction: 'outlet',
          from_customer_id: fromCustId,
          to_direction: 'depot',
          to_depot_id: Number(toDepotId),
          return_reason: 'Workshop repair completed',
          movement_date: movementDate || new Date().toISOString(),
          performed_by: user?.id || 1,
          notes:
            notes.trim() ||
            `Returning standby cooler ${workshopReturnInfo?.standby_serial || ''} after job ${jobNumber}`,
        });
        onClose();
        await onSuccess?.();
      } catch (error) {
        console.error('Failed to return standby cooler:', error);
      }
      return;
    }

    if (!toDepotId) return;
    try {
      await createWorkshopReturnMutation.mutateAsync({
        id: ticket.id,
        data: {
          to_depot_id: Number(toDepotId),
          movement_date: movementDate || undefined,
          install_standby: Boolean(
            installStandby && standbyAssetId && originalOutlet?.id
          ),
          standby_asset_id:
            installStandby && standbyAssetId ? Number(standbyAssetId) : undefined,
        },
      });
      onClose();
      await onSuccess?.();
    } catch (error) {
      console.error('Failed to save workshop return movement:', error);
    }
  };

  const dialogTitle = useMemo(() => {
    if (isStandbyOnly) return 'Install Standby Cooler';
    if (isRedeploy) return 'Redeploy Repaired Cooler';
    if (isReturnStandby) return 'Return Standby Cooler';
    return 'Create Asset Movement';
  }, [isStandbyOnly, isRedeploy, isReturnStandby]);

  const submitButtonLabel = useMemo(() => {
    if (isPending) return 'Saving...';
    if (isStandbyOnly) return 'Install standby cooler';
    if (isRedeploy) return 'Redeploy cooler';
    if (isReturnStandby) return 'Return standby cooler';
    return 'Save movement';
  }, [isPending, isStandbyOnly, isRedeploy, isReturnStandby]);

  const isSubmitDisabled = useMemo(() => {
    if (isPending) return true;
    if (isStandbyOnly) return !toDepotId || !standbyAssetId;
    if (isRedeploy) return !toDepotId || !targetCustomerId;
    if (isReturnStandby)
      return (
        !toDepotId ||
        !workshopReturnInfo?.standby_asset_id ||
        !(workshopReturnInfo?.from_customer_id || originalOutlet?.id)
      );
    return !toDepotId;
  }, [
    isPending,
    isStandbyOnly,
    isRedeploy,
    isReturnStandby,
    toDepotId,
    standbyAssetId,
    targetCustomerId,
    workshopReturnInfo,
    originalOutlet?.id,
  ]);

  return (
    <Dialog
      open={open}
      onClose={() => !isPending && onClose()}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle className="!flex !items-center !justify-between !px-5 !py-3.5 !border-b !border-gray-200">
        <Typography variant="subtitle1" className="!font-bold !text-gray-900">
          {dialogTitle}
        </Typography>
        <IconButton size="small" onClick={onClose} disabled={isPending}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent className="!p-5 !space-y-4">
        <Alert severity="info" className="!text-xs">
          {isStandbyOnly ? (
            <>
              Installing a replacement standby cooler at{' '}
              <strong>{originalOutlet?.name || 'Outlet'}</strong> linked to job{' '}
              <strong>{jobNumber}</strong>.
            </>
          ) : isRedeploy ? (
            <>
              Redeploying repaired cooler <strong>{coolerTitle}</strong> from{' '}
              <strong>{selectedDepotName}</strong> back to{' '}
              <strong>{selectedCustomerName}</strong> following closure of job{' '}
              <strong>{jobNumber}</strong>.
            </>
          ) : isReturnStandby ? (
            <>
              Returning standby cooler <strong>{standbySerial}</strong> from{' '}
              <strong>{originalOutlet?.name || 'Outlet'}</strong> back to{' '}
              <strong>{selectedDepotName}</strong> following repair of original cooler.
            </>
          ) : (
            <>
              Pre-filled return movement from maintenance job{' '}
              <strong>{jobNumber}</strong>.
            </>
          )}
        </Alert>

        {isRedeploy && hasActiveStandby && (
          <Alert severity="warning" className="!text-xs">
            Standby cooler <strong>{standbySerial}</strong> is currently installed at{' '}
            {originalOutlet?.name || 'the outlet'}. Remember to return the standby cooler
            to depot using the <strong>Return Standby</strong> action.
          </Alert>
        )}

        <Box className="!grid !grid-cols-1 sm:!grid-cols-2 !gap-4">
          <Input
            label="Movement Type"
            value={
              isStandbyOnly
                ? 'Installation (Standby)'
                : isRedeploy
                  ? 'Installation (Redeploy)'
                  : isReturnStandby
                    ? 'Return (Standby)'
                    : 'Return'
            }
            disabled
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <Input
            label="Linked Job"
            value={jobNumber}
            disabled
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <Input
            label={
              isStandbyOnly
                ? 'Original Cooler (At Workshop)'
                : isReturnStandby
                  ? 'Standby Cooler'
                  : 'Cooler'
            }
            value={isReturnStandby ? standbySerial : coolerTitle}
            disabled
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <Input
            label="Movement Date"
            type="date"
            value={movementDate}
            onChange={e => setMovementDate(e.target.value)}
            required
            slotProps={{ inputLabel: { shrink: true } }}
          />

          {isRedeploy ? (
            <Select
              label="From Depot"
              value={toDepotId}
              loading={isDepotsLoading}
              disableClearable
              required
              onChange={e => setToDepotId(String(e.target.value || ''))}
            >
              {depotOptions.map(depot => (
                <MenuItem key={depot.id} value={String(depot.id)}>
                  {depot.name}
                </MenuItem>
              ))}
            </Select>
          ) : isReturnStandby ? (
            <Input
              label="From Outlet"
              value={originalOutlet?.name || 'Outlet'}
              disabled
              slotProps={{ inputLabel: { shrink: true } }}
            />
          ) : isStandbyOnly ? (
            <Select
              label="From Depot"
              value={toDepotId}
              loading={isDepotsLoading}
              disableClearable
              required
              onChange={e => setToDepotId(String(e.target.value || ''))}
            >
              {depotOptions.map(depot => (
                <MenuItem key={depot.id} value={String(depot.id)}>
                  {depot.name}
                </MenuItem>
              ))}
            </Select>
          ) : (
            <Input
              label="From Outlet"
              value={originalOutlet?.name || 'Current Outlet'}
              disabled
              slotProps={{ inputLabel: { shrink: true } }}
            />
          )}

          {isRedeploy ? (
            customerOptions.length > 0 ? (
              <Select
                label="To Outlet"
                value={targetCustomerId}
                loading={isCustomersLoading}
                disableClearable
                required
                onChange={e => setTargetCustomerId(String(e.target.value || ''))}
              >
                {customerOptions.map(c => (
                  <MenuItem key={c.id} value={String(c.id)}>
                    {c.name} {c.code ? `(${c.code})` : ''}
                  </MenuItem>
                ))}
              </Select>
            ) : (
              <Input
                label="To Outlet"
                value={selectedCustomerName}
                disabled
                slotProps={{ inputLabel: { shrink: true } }}
              />
            )
          ) : isReturnStandby ? (
            <Select
              label="To Depot"
              value={toDepotId}
              loading={isDepotsLoading}
              disableClearable
              required
              onChange={e => setToDepotId(String(e.target.value || ''))}
            >
              {depotOptions.map(depot => (
                <MenuItem key={depot.id} value={String(depot.id)}>
                  {depot.name}
                </MenuItem>
              ))}
            </Select>
          ) : isStandbyOnly ? (
            <Input
              label="To Outlet"
              value={originalOutlet?.name || 'Outlet'}
              disabled
              slotProps={{ inputLabel: { shrink: true } }}
            />
          ) : (
            <Select
              label="To Depot"
              value={toDepotId}
              loading={isDepotsLoading}
              disableClearable
              required
              onChange={e => setToDepotId(String(e.target.value || ''))}
            >
              {depotOptions.map(depot => (
                <MenuItem key={depot.id} value={String(depot.id)}>
                  {depot.name}
                </MenuItem>
              ))}
            </Select>
          )}

          {isReturnStandby && (
            <Input
              label="Return Reason"
              value="Workshop repair completed"
              disabled
              slotProps={{ inputLabel: { shrink: true } }}
            />
          )}

          {(isRedeploy || isReturnStandby) && (
            <Box className="sm:col-span-2">
              <Input
                label="Movement Notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Optional movement notes"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Box>
          )}
        </Box>

        {(mode === 'return' || mode === 'standby') && Boolean(originalOutlet?.id) && (
          <Box className="!p-3.5 !rounded-lg !border !border-gray-200 !bg-gray-50/70 !space-y-3">
            {!isStandbyOnly && (
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={installStandby && standbyCandidates.length > 0}
                    disabled={
                      isStandbyLoading || standbyCandidates.length === 0
                    }
                    onChange={e => setInstallStandby(e.target.checked)}
                  />
                }
                label={
                  <Typography
                    variant="body2"
                    className="!text-xs !font-semibold !text-gray-900"
                  >
                    Also install a standby cooler at {originalOutlet?.name}
                  </Typography>
                }
                className="!m-0"
              />
            )}

            {isStandbyLoading ? (
              <Typography
                variant="caption"
                className="!text-gray-500 !block !pl-1"
              >
                Checking available coolers at {selectedDepotName}...
              </Typography>
            ) : standbyCandidates.length > 0 ? (
              <Box className="!space-y-2 !pt-1">
                {(isStandbyOnly || installStandby) && (
                  <Select
                    label="Standby Cooler"
                    size="small"
                    fullWidth
                    disableClearable
                    required={isStandbyOnly}
                    value={standbyAssetId}
                    onChange={e => setStandbyAssetId(String(e.target.value || ''))}
                  >
                    {standbyCandidates.map(asset => (
                      <MenuItem key={asset.id} value={String(asset.id)}>
                        {`${asset.serial_number} - ${asset.asset_master_asset_types?.name || asset.name}`}
                      </MenuItem>
                    ))}
                  </Select>
                )}
                <Typography
                  variant="caption"
                  className="!text-gray-600 !block"
                >
                  Uses{' '}
                  <strong>
                    {selectedStandbyAsset?.serial_number} -{' '}
                    {selectedStandbyAsset?.asset_master_asset_types?.name ||
                      selectedStandbyAsset?.name}
                  </strong>{' '}
                  (Available at {selectedDepotName}), so the outlet keeps
                  selling cold stock.
                </Typography>
              </Box>
            ) : (
              <Typography
                variant="caption"
                className="!text-gray-500 !block !pl-1"
              >
                No available coolers in stock at {selectedDepotName}.
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions className="!px-5 !py-3 !border-t !border-gray-200 !gap-2">
        <Button
          type="button"
          variant="outlined"
          size="small"
          onClick={onClose}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="contained"
          size="small"
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
        >
          {submitButtonLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WorkshopReturnModal;
