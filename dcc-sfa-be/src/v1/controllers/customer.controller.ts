import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';
import { deleteFile, uploadFile } from '../../utils/blackbaze';

const generateCustomerCode = async (name: string) => {
  const prefix = name.slice(0, 3).toUpperCase();
  const lastCustomers = await prisma.customers.findFirst({
    orderBy: { id: 'desc' },
    select: { code: true },
  });

  let newNumber = 1;
  if (lastCustomers && lastCustomers.code) {
    const match = lastCustomers.code.match(/(\d+)$/);
    if (match) {
      newNumber = parseInt(match[1], 10) + 1;
    }
  }
  const code = `${prefix}${newNumber.toString().padStart(3, '0')}`;

  return code;
};
const serializeCustomer = async (customer: any) => {
  if (!customer) {
    return {};
  }

  return {
    id: customer.id,
    name: customer.name,
    short_name: customer.short_name || null,
    code: customer.code,
    zones_id: customer.zones_id || null,
    customer_type_id: customer.customer_type_id || null,
    customer_channel_id: customer.customer_channel_id || null,
    customer_category_id: customer.customer_category_id ?? null,
    profile_picture: customer.profile_picture || null,
    type: customer.type || null,
    internal_code_one: customer.internal_code_one || null,
    internal_code_two: customer.internal_code_two || null,
    contact_person: customer.contact_person || null,
    phone_number: customer.phone_number || null,
    email: customer.email || null,
    address: customer.address || null,
    city: customer.city || null,
    state: customer.state || null,
    zipcode: customer.zipcode || null,
    latitude: customer.latitude?.toString() || null,
    longitude: customer.longitude?.toString() || null,
    credit_limit: customer.credit_limit?.toString() || null,
    outstanding_amount: customer.outstanding_amount?.toString() || '0',
    route_id: customer.route_id || null,
    salesperson_id: customer.salesperson_id || null,
    nfc_tag_code: customer.nfc_tag_code || null,
    last_visit_date: customer.last_visit_date || null,
    is_active: customer.is_active,
    createdate: customer.createdate,
    createdby: customer.createdby,
    updatedate: customer.updatedate || null,
    updatedby: customer.updatedby || null,
    log_inst: customer.log_inst,
    customer_zones: customer.customer_zones
      ? {
          id: customer.customer_zones.id,
          name: customer.customer_zones.name,
          code: customer.customer_zones.code,
        }
      : null,
    customer_routes: customer.customer_routes
      ? {
          id: customer.customer_routes.id,
          name: customer.customer_routes.name,
          code: customer.customer_routes.code,
        }
      : null,

    customer_users: customer.customer_users
      ? {
          id: customer.customer_users.id,
          name: customer.customer_users.name,
          email: customer.customer_users.email,
        }
      : null,
    customer_type: customer.customer_type_customer
      ? {
          id: customer.customer_type_customer.id,
          type_name: customer.customer_type_customer.type_name,
          type_code: customer.customer_type_customer.type_code,
        }
      : null,
    customer_category: customer.customer_category_customer
      ? {
          id: customer.customer_category_customer.id,
          category_name: customer.customer_category_customer.category_name,
          category_code: customer.customer_category_customer.category_code,
          level: customer.customer_category_customer.level,
        }
      : null,
    customer_channel: customer.customer_channel_customer
      ? {
          id: customer.customer_channel_customer.id,
          channel_name: customer.customer_channel_customer.channel_name,
          channel_code: customer.customer_channel_customer.channel_code,
        }
      : null,
    outlet_images: (customer.outlet_images_customers || []).map((img: any) => ({
      id: img.id,
      image_url: img.image_url,
      createdate: img.createdate,
      createdby: img.createdby,
    })),
  };
};

const checkIfCustomerChanged = (existing: any, incoming: any): boolean => {
  const fieldsToCompare = [
    'name',
    'short_name',
    'zones_id',
    'customer_type_id',
    'customer_channel_id',
    'type',
    'internal_code_one',
    'internal_code_two',
    'contact_person',
    'phone_number',
    'email',
    'address',
    'city',
    'state',
    'zipcode',
    'latitude',
    'longitude',
    'credit_limit',
    'outstanding_amount',
    'route_id',
    'salesperson_id',
    'nfc_tag_code',
    'is_active',
  ];
  let hasAnyChange = false;

  for (const field of fieldsToCompare) {
    if (!(field in incoming)) {
      console.log(`Field "${field}" not in incoming, skipping`);
      continue;
    }

    let existingValue = existing[field];
    let incomingValue = incoming[field];

    if (
      ['latitude', 'longitude', 'credit_limit', 'outstanding_amount'].includes(
        field
      )
    ) {
      if (existingValue !== null && existingValue !== undefined) {
        if (typeof existingValue === 'object' && existingValue.toNumber) {
          existingValue = existingValue.toNumber().toString();
        } else if (
          typeof existingValue === 'object' &&
          existingValue.toString
        ) {
          existingValue = parseFloat(existingValue.toString()).toString();
        } else {
          existingValue = parseFloat(existingValue).toString();
        }
      }

      if (incomingValue !== null && incomingValue !== undefined) {
        incomingValue = parseFloat(incomingValue).toString();
      }
    }

    const isDifferent = existingValue != incomingValue;

    if (isDifferent) {
      console.log(` Field "${field}" chang:`, {
        existing: existingValue,
        incoming: incomingValue,
        existingType: typeof existingValue,
        incomingType: typeof incomingValue,
      });
      hasAnyChange = true;
    } else {
      console.log(` Field "${field}" sme:`, existingValue);
    }
  }

  return hasAnyChange;
};

const convertIsActive = (isActiveParam: any): string | undefined => {
  if (
    isActiveParam === undefined ||
    isActiveParam === null ||
    isActiveParam === ''
  ) {
    return undefined;
  }
  return isActiveParam === '1' || isActiveParam === 1 ? 'Y' : 'N';
};

export const customerController = {
  async uploadCustomerImages(req: any, res: any) {
    try {
      const customerId = parseInt(req.params.id, 10);
      if (!customerId) {
        return res
          .status(400)
          .json({ success: false, message: 'Missing customer id.' });
      }

      const profileFile = req.files?.profile_picture?.[0] || req.file;
      const outletFiles = req.files?.outlet_images || [];

      const customerIsActive = convertIsActive(req.body.is_active);

      if (customerIsActive !== undefined) {
        await prisma.customers.update({
          where: { id: customerId },
          data: {
            is_active: customerIsActive,
            updatedate: new Date(),
            updatedby: req.user?.id || 1,
          },
        });
      }

      let profileUrl = null;
      if (profileFile) {
        const customer = await prisma.customers.findUnique({
          where: { id: customerId },
        });
        if (customer?.profile_picture) {
          try {
            await deleteFile(customer.profile_picture);
          } catch {}
        }

        const fileName = `customer-profiles/${Date.now()}-${customerId}-${profileFile.originalname}`;
        profileUrl = await uploadFile(
          profileFile.buffer,
          fileName,
          profileFile.mimetype
        );

        await prisma.customers.update({
          where: { id: customerId },
          data: { profile_picture: profileUrl, updatedate: new Date() },
        });
      }

      if (outletFiles.length > 0) {
        const oldImages = await prisma.customer_image.findMany({
          where: { customer_id: customerId, is_active: 'Y' },
        });
        for (const img of oldImages) {
          try {
            await deleteFile(img.image_url);
          } catch {}
        }

        await prisma.customer_image.updateMany({
          where: { customer_id: customerId, is_active: 'Y' },
          data: { is_active: 'N' },
        });
        const uploadedOutletUrls: string[] = [];
        for (let i = 0; i < outletFiles.length; i++) {
          const file = outletFiles[i];
          const fileName = `customer-images/${Date.now()}-${i}-${file.originalname}`;
          const url = await uploadFile(file.buffer, fileName, file.mimetype);
          uploadedOutletUrls.push(url);
          await prisma.customer_image.create({
            data: {
              customer_id: customerId,
              image_url: url,
              is_active: 'Y',
              createdby: req.user?.id || 1,
              createdate: new Date(),
              log_inst: 1,
            },
          });
        }

        return res.status(200).json({
          success: true,
          message: 'Images  replaced.',
          profile_picture: profileUrl,
          outlet_images: uploadedOutletUrls,
        });
      }

      res.status(200).json({
        success: true,
        message: profileUrl
          ? 'Profile picture replaced.'
          : 'No images uploaded.',
        profile_picture: profileUrl,
        outlet_images: [],
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async bulkUpsertCustomers(req: any, res: any) {
    try {
      if (!req.body) {
        return res.status(400).json({
          success: false,
          message: 'Request body is missing',
        });
      }

      if (!req.body.customers) {
        return res.status(400).json({
          success: false,
          message: 'customers field is required',
        });
      }

      let customersData;
      if (typeof req.body.customers === 'string') {
        if (!req.body.customers.trim()) {
          return res.status(400).json({
            success: false,
            message: 'customers field cannot be empty',
          });
        }
        try {
          customersData = JSON.parse(req.body.customers);
        } catch (error: any) {
          return res.status(400).json({
            success: false,
            message: 'Invalid JSON format for customers field',
          });
        }
      } else {
        // customersData = req.body.customers;
        customersData = req.body.customers;

        customersData.forEach((customer: any) => {
          delete customer.code;
        });
      }

      const uploadedFiles =
        (req.files as {
          outlet_images?: Express.Multer.File[];
          profile_picture?: Express.Multer.File[];
          customer_images?: Express.Multer.File[];
          profile_pics?: Express.Multer.File[];
        }) || {};

      const customerImages =
        uploadedFiles.outlet_images || uploadedFiles.outlet_images || [];
      const profilePics =
        uploadedFiles.profile_picture || uploadedFiles.profile_pics || [];

      if (!Array.isArray(customersData) || customersData.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request. Expected an array of customers',
        });
      }

      let imageMapping: Record<number, number[]> = {};
      let profileMapping: Record<number, number> = {};

      if (req.body.imageMapping) {
        try {
          imageMapping =
            typeof req.body.imageMapping === 'string'
              ? JSON.parse(req.body.imageMapping)
              : req.body.imageMapping;
        } catch (e) {
          imageMapping = {};
        }
      }

      if (req.body.profileMapping) {
        try {
          profileMapping =
            typeof req.body.profileMapping === 'string'
              ? JSON.parse(req.body.profileMapping)
              : req.body.profileMapping;
        } catch (e) {
          profileMapping = {};
        }
      }

      const hasImageMapping = Object.keys(imageMapping).length > 0;
      const hasProfileMapping = Object.keys(profileMapping).length > 0;

      if (!hasImageMapping && customerImages.length > 0) {
        for (
          let i = 0;
          i < customersData.length && i < customerImages.length;
          i++
        ) {
          imageMapping[i] = [i];
        }
      }

      if (!hasProfileMapping && profilePics.length > 0) {
        for (
          let i = 0;
          i < customersData.length && i < profilePics.length;
          i++
        ) {
          profileMapping[i] = i;
        }
      }

      const allowedFields = [
        'code',
        'name',
        'type',
        'contact_person',
        'phone_number',
        'email',
        'address',
        'city',
        'state',
        'zipcode',
        'latitude',
        'longitude',
        'credit_limit',
        'outstanding_amount',
        'last_visit_date',
        'is_active',
        'log_inst',
      ];

      // const validationErrors = [];
      // for (let i = 0; i < customersData.length; i++) {
      //   const customer = customersData[i];

      //   if (!customer.name) {
      //     validationErrors.push({
      //       index: i,
      //       customer: customer,
      //       reason: 'Customer name is required',
      //     });
      //   }

      //   // if (!customer.email && !customer.phone_number) {
      //   //   validationErrors.push({
      //   //     index: i,
      //   //     customer: customer,
      //   //     reason: 'Either email or phone_number is required',
      //   //   });
      //   // }
      // }

      // if (validationErrors.length > 0) {
      //   return res.status(400).json({
      //     success: false,
      //     message: 'Validation failed',
      //     errors: validationErrors,
      //   });
      // }

      const results = {
        created: [] as any[],
        updated: [] as any[],
        skipped: [] as any[],
        errors: [] as any[],
      };

      const uploadedImageUrls: string[] = [];
      const uploadedProfileUrls: string[] = [];

      try {
        for (let i = 0; i < customerImages.length; i++) {
          const file = customerImages[i];
          const fileName = `customer-images/${Date.now()}-${i}-${file.originalname}`;

          try {
            const imageUrl = await uploadFile(
              file.buffer,
              fileName,
              file.mimetype
            );
            uploadedImageUrls.push(imageUrl);
          } catch (uploadError: any) {
            console.error(`Error uploading customer image ${i}:`, uploadError);
            uploadedImageUrls.push('');
          }
        }

        for (let i = 0; i < profilePics.length; i++) {
          const file = profilePics[i];
          const fileName = `customer-profiles/${Date.now()}-${i}-${file.originalname}`;

          try {
            const profileUrl = await uploadFile(
              file.buffer,
              fileName,
              file.mimetype
            );
            uploadedProfileUrls.push(profileUrl);
          } catch (uploadError: any) {
            console.error(`Error uploading profile pic ${i}:`, uploadError);
            uploadedProfileUrls.push('');
          }
        }

        for (
          let customerIndex = 0;
          customerIndex < customersData.length;
          customerIndex++
        ) {
          const customerData = customersData[customerIndex];

          try {
            const zones_id = customerData.zones_id;
            const route_id = customerData.route_id;
            const salesperson_id = customerData.salesperson_id;
            const customer_type_id = customerData.customer_type_id;
            const customer_channel_id = customerData.customer_channel_id;

            const cleanData: any = {};
            Object.keys(customerData).forEach(key => {
              if (allowedFields.includes(key)) {
                if (
                  [
                    'credit_limit',
                    'outstanding_amount',
                    'latitude',
                    'longitude',
                  ].includes(key)
                ) {
                  cleanData[key] =
                    customerData[key] === '' ? null : customerData[key];
                } else {
                  cleanData[key] = customerData[key];
                }
              }
            });

            if (profileMapping[customerIndex] !== undefined) {
              const profileIndex = profileMapping[customerIndex];
              if (
                profileIndex < uploadedProfileUrls.length &&
                uploadedProfileUrls[profileIndex]
              ) {
                cleanData.profile_picture = uploadedProfileUrls[profileIndex];
              }
            }

            let whereConditions: any = {};

            if (cleanData.email && cleanData.phone_number) {
              whereConditions.OR = [
                { email: cleanData.email },
                { phone_number: cleanData.phone_number },
              ];
            } else if (cleanData.email) {
              whereConditions.email = cleanData.email;
            } else if (cleanData.phone_number) {
              whereConditions.phone_number = cleanData.phone_number;
            }

            const existingCustomer = await prisma.customers.findFirst({
              where: whereConditions,
            });

            let customerId: number;
            let oldProfilePic: string | null = null;
            let isUpdate = false;

            if (existingCustomer) {
              const hasChanged = checkIfCustomerChanged(
                existingCustomer,
                customerData
              );
              const hasNewImages = imageMapping[customerIndex]?.length > 0;
              const hasNewProfile = profileMapping[customerIndex] !== undefined;

              if (!hasChanged && !hasNewImages && !hasNewProfile) {
                results.skipped.push({
                  code: existingCustomer.code,
                  id: existingCustomer.id,
                  name: existingCustomer.name,
                  reason: 'No changes detected',
                });
                continue;
              }

              if (hasNewProfile && existingCustomer.profile_picture) {
                oldProfilePic = existingCustomer.profile_picture;
              }

              const updateData: any = {
                ...cleanData,
                updatedate: new Date(),
                updatedby: req.user?.id || 1,
              };

              if (zones_id !== undefined) {
                if (zones_id === null) {
                  updateData.customer_zones = { disconnect: true };
                } else {
                  const zoneExists = await prisma.zones.findUnique({
                    where: { id: zones_id },
                  });
                  if (zoneExists) {
                    updateData.customer_zones = { connect: { id: zones_id } };
                  }
                }
              }

              if (route_id !== undefined) {
                if (route_id === null) {
                  updateData.customer_routes = { disconnect: true };
                } else {
                  const routeExists = await prisma.routes.findUnique({
                    where: { id: route_id },
                  });
                  if (routeExists) {
                    updateData.customer_routes = {
                      connect: { id: route_id },
                    };
                  }
                }
              }

              if (salesperson_id !== undefined) {
                if (salesperson_id === null) {
                  updateData.customer_users = { disconnect: true };
                } else {
                  const userExists = await prisma.users.findUnique({
                    where: { id: salesperson_id },
                  });
                  if (userExists) {
                    updateData.customer_users = {
                      connect: { id: salesperson_id },
                    };
                  }
                }
              }

              if (customer_type_id !== undefined) {
                if (customer_type_id === null) {
                  updateData.customer_type_customer = { disconnect: true };
                } else {
                  const typeExists = await prisma.customer_type.findUnique({
                    where: { id: customer_type_id },
                  });
                  if (typeExists) {
                    updateData.customer_type_customer = {
                      connect: { id: customer_type_id },
                    };
                  }
                }
              }

              if (customer_channel_id !== undefined) {
                if (customer_channel_id === null) {
                  updateData.customer_channel_customer = { disconnect: true };
                } else {
                  const channelExists =
                    await prisma.customer_channel.findUnique({
                      where: { id: customer_channel_id },
                    });
                  if (channelExists) {
                    updateData.customer_channel_customer = {
                      connect: { id: customer_channel_id },
                    };
                  }
                }
              }

              await prisma.customers.update({
                where: { id: existingCustomer.id },
                data: updateData,
              });

              customerId = existingCustomer.id;
              isUpdate = true;

              if (oldProfilePic) {
                try {
                  await deleteFile(oldProfilePic);
                } catch (deleteError) {
                  console.error('Error deleting old profile pic:', deleteError);
                }
              }
            } else {
              if (!cleanData.code) {
                let uniqueCode = await generateCustomerCode(cleanData.name);
                let attempts = 0;
                const maxAttempts = 10;

                while (attempts < maxAttempts) {
                  const codeExists = await prisma.customers.findUnique({
                    where: { code: uniqueCode },
                  });

                  if (!codeExists) break;

                  const timestamp = Date.now().toString().slice(-4);
                  uniqueCode = `${uniqueCode.slice(0, -3)}${timestamp}`;
                  attempts++;
                }

                if (attempts >= maxAttempts) {
                  throw new Error('Failed to generate unique code');
                }

                cleanData.code = uniqueCode;
              }

              const createData: any = {
                ...cleanData,
                createdby: req.user?.id || 1,
                log_inst: customerData.log_inst || 1,
                createdate: new Date(),
              };

              if (zones_id !== undefined && zones_id !== null) {
                const zoneExists = await prisma.zones.findUnique({
                  where: { id: zones_id },
                });
                if (zoneExists) {
                  createData.customer_zones = { connect: { id: zones_id } };
                }
              }

              if (route_id !== undefined && route_id !== null) {
                const routeExists = await prisma.routes.findUnique({
                  where: { id: route_id },
                });
                if (routeExists) {
                  createData.customer_routes = { connect: { id: route_id } };
                }
              }

              if (salesperson_id !== undefined && salesperson_id !== null) {
                const userExists = await prisma.users.findUnique({
                  where: { id: salesperson_id },
                });
                if (userExists) {
                  createData.customer_users = {
                    connect: { id: salesperson_id },
                  };
                }
              }

              if (customer_type_id !== undefined && customer_type_id !== null) {
                const typeExists = await prisma.customer_type.findUnique({
                  where: { id: customer_type_id },
                });
                if (typeExists) {
                  createData.customer_type_customer = {
                    connect: { id: customer_type_id },
                  };
                }
              }

              if (
                customer_channel_id !== undefined &&
                customer_channel_id !== null
              ) {
                const channelExists = await prisma.customer_channel.findUnique({
                  where: { id: customer_channel_id },
                });
                if (channelExists) {
                  createData.customer_channel_customer = {
                    connect: { id: customer_channel_id },
                  };
                }
              }

              const newCustomer = await prisma.customers.create({
                data: createData,
              });
              customerId = newCustomer.id;
              isUpdate = false;
            }

            if (
              imageMapping[customerIndex] &&
              Array.isArray(imageMapping[customerIndex])
            ) {
              const fileIndices = imageMapping[customerIndex];

              for (const fileIndex of fileIndices) {
                if (
                  fileIndex < uploadedImageUrls.length &&
                  uploadedImageUrls[fileIndex]
                ) {
                  await prisma.customer_image.create({
                    data: {
                      customer_id: customerId,
                      image_url: uploadedImageUrls[fileIndex],
                      is_active: 'Y',
                      createdby: req.user?.id || 1,
                      createdate: new Date(),
                      log_inst: 1,
                    },
                  });
                }
              }
            }

            const customerToSerialize = await prisma.customers.findUnique({
              where: { id: customerId },
              include: {
                customer_zones: true,
                customer_routes: true,
                customer_users: true,
                customer_type_customer: {
                  select: {
                    id: true,
                    type_name: true,
                    type_code: true,
                  },
                },
                customer_channel_customer: {
                  select: {
                    id: true,
                    channel_name: true,
                    channel_code: true,
                  },
                },
                outlet_images_customers: {
                  where: { is_active: 'Y' },
                  orderBy: { createdate: 'desc' },
                  select: {
                    id: true,
                    image_url: true,
                    createdate: true,
                    createdby: true,
                  },
                },
              },
            });

            const serialized = await serializeCustomer(customerToSerialize);

            if (isUpdate) {
              results.updated.push(serialized);
            } else {
              results.created.push(serialized);
            }
          } catch (error: any) {
            console.error('Error processing customer:', error);
            results.errors.push({
              customer: {
                name: customerData.name,
                email: customerData.email,
                phone_number: customerData.phone_number,
              },
              reason: error.message || 'Unknown error occurred',
              error_code: error.code,
            });
          }
        }

        if (results.errors.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Bulk upsert completed with errors',
            summary: {
              total: customersData.length,
              created: results.created.length,
              updated: results.updated.length,
              skipped: results.skipped.length,
              errors: results.errors.length,
              outlet_images_uploaded: uploadedImageUrls.filter(url => url)
                .length,
              profile_picture_uploaded: uploadedProfileUrls.filter(url => url)
                .length,
            },
            data: results,
          });
        }

        res.status(200).json({
          success: true,
          message: 'Bulk upsert completed successfully',
          summary: {
            total: customersData.length,
            created: results.created.length,
            updated: results.updated.length,
            skipped: results.skipped.length,
            errors: results.errors.length,
            outlet_images_uploaded: uploadedImageUrls.filter(url => url).length,
            profile_picture_uploaded: uploadedProfileUrls.filter(url => url)
              .length,
          },
          data: results,
        });
      } catch (error: any) {
        for (const imageUrl of [...uploadedImageUrls, ...uploadedProfileUrls]) {
          if (imageUrl) {
            try {
              await deleteFile(imageUrl);
            } catch (deleteError) {
              console.error('Error cleaning up uploaded file:', deleteError);
            }
          }
        }
        throw error;
      }
    } catch (error: any) {
      console.error('Bulk Upsert Error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  },

  async createCustomers(req: Request, res: Response) {
    try {
      const data = req.body;
      if (!data.name) {
        return res.status(400).json({ message: 'Customer name is required' });
      }

      const {
        credit_limit,
        outstanding_amount,
        latitude,
        longitude,
        ...otherData
      } = data;
      const processedData = {
        ...otherData,
        credit_limit: credit_limit === '' ? null : credit_limit,
        outstanding_amount:
          outstanding_amount === '' ? null : outstanding_amount,
        latitude: latitude === '' ? null : latitude,
        longitude: longitude === '' ? null : longitude,
      };

      const newCode = await generateCustomerCode(data.name);
      const customer = await prisma.customers.create({
        data: {
          ...processedData,
          code: newCode,
          createdby: req.user?.id || 1,
          log_inst: data.log_inst || 1,
          createdate: new Date(),
        },
        include: {
          customer_zones: true,
          customer_routes: true,
          customer_users: true,
          customer_type_customer: {
            select: {
              id: true,
              type_name: true,
              type_code: true,
            },
          },
          customer_channel_customer: {
            select: {
              id: true,
              channel_name: true,
              channel_code: true,
            },
          },
        },
      });

      const serializedCustomer = await serializeCustomer(customer);
      res.status(201).json({
        message: 'Customer created successfully',
        data: serializedCustomer,
      });
    } catch (error: any) {
      console.error('Create Customer Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getAllCustomers(req: any, res: any) {
    try {
      const { page, limit, search, type, salesperson_id, route_id, isActive } =
        req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase() : '';

      const filters: any = {
        ...(search && {
          OR: [
            { name: { contains: searchLower } },
            { code: { contains: searchLower } },
            { email: { contains: searchLower } },
            { phone_number: { contains: searchLower } },
          ],
        }),
        ...(type && type !== 'All' && { type }),
        ...(salesperson_id && {
          salesperson_id: parseInt(salesperson_id as string, 10),
        }),
        ...(route_id && { route_id: parseInt(route_id as string, 10) }),
        ...(isActive && {
          is_active: isActive,
        }),
      };

      const { data, pagination } = await paginate({
        model: prisma.customers,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          customer_zones: true,
          customer_routes: true,
          customer_users: true,
          customer_type_customer: {
            select: {
              id: true,
              type_name: true,
              type_code: true,
            },
          },
          customer_category_customer: {
            select: {
              id: true,
              category_name: true,
              category_code: true,
              level: true,
            },
          },
          customer_channel_customer: {
            select: {
              id: true,
              channel_name: true,
              channel_code: true,
            },
          },
          outlet_images_customers: {
            where: { is_active: 'Y' },
            orderBy: { createdate: 'desc' },
            select: {
              id: true,
              image_url: true,
              createdate: true,
              createdby: true,
            },
          },
        },
      });

      const distributors = await prisma.customers.count({
        where: { type: 'Distributor' },
      });
      const retailers = await prisma.customers.count({
        where: { type: 'Retailer' },
      });

      const wholesellers = await prisma.customers.count({
        where: { type: 'Wholesaler' },
      });
      const totalCustomers = await prisma.customers.count();
      const activeCustomers = await prisma.customers.count({
        where: { is_active: 'Y' },
      });
      const inactiveCustomers = await prisma.customers.count({
        where: { is_active: 'N' },
      });
      const totals = await prisma.customers.aggregate({
        _sum: {
          credit_limit: true,
          outstanding_amount: true,
        },
      });

      const totalCreditLimit = totals._sum.credit_limit || 0;
      const totalOutstandingAmount = totals._sum.outstanding_amount || 0;

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const newCustomersThisMonth = await prisma.customers.count({
        where: {
          createdate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });

      const serializedData = await Promise.all(
        data.map((c: any) => serializeCustomer(c))
      );

      res.success(
        'Customers retrieved successfully',
        serializedData,
        200,
        pagination,
        {
          new_customers_this_month: newCustomersThisMonth,
          total_customers: totalCustomers,
          active_customers: activeCustomers,
          inactive_customers: inactiveCustomers,
          distributors: distributors,
          retailers: retailers,
          wholesaler: wholesellers,
          total_credit_limit: totalCreditLimit,
          total_outstanding_amount: totalOutstandingAmount,
        }
      );
    } catch (error: any) {
      console.error('Get Customers Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getCustomersById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const customer = await prisma.customers.findUnique({
        where: { id: Number(id) },
        include: {
          customer_zones: true,
          customer_routes: true,
          customer_users: true,
          customer_category_customer: true,
          customer_type_customer: {
            select: {
              id: true,
              type_name: true,
              type_code: true,
            },
          },
          customer_channel_customer: {
            select: {
              id: true,
              channel_name: true,
              channel_code: true,
            },
          },
          outlet_images_customers: {
            orderBy: { createdate: 'desc' },
          },
          customer_documents_customers: {
            orderBy: { createdate: 'desc' },
          },
          customer_assets_customers: {
            include: {
              customer_asset_types: {
                select: { id: true, name: true, category: true, brand: true },
              },
              customer_assets_users: {
                select: { id: true, name: true, email: true },
              },

              customers_assets_history: {
                orderBy: { change_date: 'desc' },
                include: {
                  users_customer_assets_history_changed_byTousers: {
                    select: { id: true, name: true, email: true },
                  },
                },
              },
            },
            orderBy: { createdate: 'desc' },
          },
        },
      });

      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      const serializedCustomer = await serializeCustomer(customer);
      res.json({
        success: true,
        message: 'Customer fetched successfully',
        data: {
          customer: serializedCustomer,
          documents: customer.customer_documents_customers || [],
          assets: customer.customer_assets_customers || [],
        },
      });
    } catch (error: any) {
      console.error('Get Customer Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateCustomers(req: any, res: any) {
    try {
      const { id } = req.params;
      const existingCustomer = await prisma.customers.findUnique({
        where: { id: Number(id) },
      });

      if (!existingCustomer) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      const {
        credit_limit,
        outstanding_amount,
        latitude,
        longitude,
        ...otherData
      } = req.body;

      const data = {
        ...otherData,
        credit_limit: credit_limit === '' ? null : credit_limit,
        outstanding_amount:
          outstanding_amount === '' ? null : outstanding_amount,
        latitude: latitude === '' ? null : latitude,
        longitude: longitude === '' ? null : longitude,
        updatedate: new Date(),
        updatedby: req.user?.id || 1,
      };
      const customer = await prisma.customers.update({
        where: { id: Number(id) },
        data,
        include: {
          customer_zones: true,
          customer_routes: true,
          customer_users: true,
          customer_type_customer: {
            select: {
              id: true,
              type_name: true,
              type_code: true,
            },
          },
          customer_channel_customer: {
            select: {
              id: true,
              channel_name: true,
              channel_code: true,
            },
          },
        },
      });

      const serializedCustomer = await serializeCustomer(customer);
      res.json({
        message: 'Customer updated successfully',
        data: serializedCustomer,
      });
    } catch (error: any) {
      console.error('Update Customer Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteCustomers(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingCustomer = await prisma.customers.findUnique({
        where: { id: Number(id) },
      });

      if (!existingCustomer) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      const [
        invoicesCount,
        ordersCount,
        visitsCount,
        coolersCount,
        paymentsCount,
      ] = await Promise.all([
        prisma.invoices.count({ where: { customer_id: Number(id) } }),
        prisma.orders.count({ where: { parent_id: Number(id) } }),
        prisma.visits.count({ where: { customer_id: Number(id) } }),
        prisma.coolers.count({ where: { customer_id: Number(id) } }),
        prisma.payments.count({ where: { customer_id: Number(id) } }),
      ]);

      const hasRelatedRecords =
        invoicesCount > 0 ||
        ordersCount > 0 ||
        visitsCount > 0 ||
        coolersCount > 0 ||
        paymentsCount > 0;

      if (hasRelatedRecords) {
        const relatedRecords = [];
        if (invoicesCount > 0)
          relatedRecords.push(`${invoicesCount} invoice(s)`);
        if (ordersCount > 0) relatedRecords.push(`${ordersCount} order(s)`);
        if (visitsCount > 0) relatedRecords.push(`${visitsCount} visit(s)`);
        if (coolersCount > 0) relatedRecords.push(`${coolersCount} cooler(s)`);
        if (paymentsCount > 0)
          relatedRecords.push(`${paymentsCount} payment(s)`);
        return res.status(400).json({
          message: 'Cannot delete customer. This customer has related records.',
          details: {
            customer: existingCustomer.name,
            relatedRecords,
            suggestion:
              'Please delete or reassign the related records first, or consider marking this customer as inactive instead of deleting.',
          },
        });
      }

      await prisma.customers.delete({ where: { id: Number(id) } });

      res.json({ message: 'Customer deleted successfully' });
    } catch (error: any) {
      console.error('Delete Customer Error:', error);

      if (error.code === 'P2003') {
        return res.status(400).json({
          message:
            'Cannot delete customer. This customer has related records in other tables.',
          details: {
            error: 'Foreign key constraint violated',
            suggestion:
              'Please delete the related records first or mark the customer as inactive.',
          },
        });
      }

      res.status(500).json({ message: error.message });
    }
  },

  async getCustomersDropdown(req: any, res: any): Promise<void> {
    try {
      const { search = '', customer_id } = req.query;
      const searchLower = search.toLowerCase().trim();
      const customerId = customer_id ? Number(customer_id) : null;

      const where: any = {
        is_active: 'Y',
      };

      if (customerId) {
        where.id = customerId;
      } else if (searchLower) {
        where.OR = [
          {
            name: {
              contains: searchLower,
            },
          },
          {
            code: {
              contains: searchLower,
            },
          },
        ];
      }

      const customers = await prisma.customers.findMany({
        where,
        select: {
          id: true,
          name: true,
          code: true,
        },
        orderBy: {
          name: 'asc',
        },
        take: 50,
      });

      res.success('Customers dropdown fetched successfully', customers, 200);
    } catch (error: any) {
      console.error('Error fetching customers dropdown:', error);
      res.error(error.message);
    }
  },

  async getCustomerRelations(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const customer = await prisma.customers.findUnique({
        where: { id: Number(id) },
        select: {
          id: true,
          zones_id: true,
          route_id: true,
          salesperson_id: true,
          customer_type_id: true,
        },
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found',
        });
      }

      const visits = await prisma.visits.findMany({
        where: { customer_id: Number(id) },
        select: { id: true },
        orderBy: { createdate: 'desc' },
      });

      res.json({
        success: true,
        message: 'Customer relations fetched successfully',
        data: {
          customer_id: customer.id,
          zones_id: customer.zones_id,
          route_id: customer.route_id,
          salesperson_id: customer.salesperson_id,
          customer_type_id: customer.customer_type_id,
          visit_ids: visits.map(v => v.id),
        },
      });
    } catch (error: any) {
      console.error('Get Customer Relations Error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
};
