#!/usr/bin/env node

/**
 * @fileoverview Permission Generator CLI
 * @description Regenerates permission hooks and mappings from menu items
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Extracts BACKEND_MODULES array from permission-auto-generator.ts
 * This ensures we have a single source of truth
 */
function extractBackendModules() {
  const generatorPath = path.join(
    __dirname,
    '../src/utils/permission-auto-generator.ts'
  );
  const fileContent = fs.readFileSync(generatorPath, 'utf-8');

  const arrayMatch = fileContent.match(
    /export const BACKEND_MODULES = \[([\s\S]*?)\] as const;/
  );

  if (!arrayMatch) {
    throw new Error(
      'Could not find BACKEND_MODULES array in permission-auto-generator.ts'
    );
  }

  const arrayContent = arrayMatch[1];
  const modules = arrayContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('//'))
    .map(line => {
      const match = line.match(/'([^']+)'/);
      return match ? match[1] : null;
    })
    .filter(Boolean);

  return modules;
}

const BACKEND_MODULES = extractBackendModules();

function generateHookCode() {
  const hookDeclarations = BACKEND_MODULES.map(module => {
    const camelCase = module.replace(/-([a-z])/g, (_, letter) =>
      letter.toUpperCase()
    );
    return `  const ${camelCase}Perms = usePermission('${module}' as BackendModule);`;
  }).join('\n');

  const permissionsObject = BACKEND_MODULES.map(module => {
    const camelCase = module.replace(/-([a-z])/g, (_, letter) =>
      letter.toUpperCase()
    );
    return `    '${module}': ${camelCase}Perms,`;
  }).join('\n');

  const dependencyArray = BACKEND_MODULES.map(module => {
    const camelCase = module.replace(/-([a-z])/g, (_, letter) =>
      letter.toUpperCase()
    );
    return `    ${camelCase}Perms,`;
  }).join('\n');

  return `/**
 * @fileoverview Auto-Generated Menu Permissions Hook
 * @description Generated automatically from menu items and backend modules
 * @generated-at ${new Date().toISOString()}
 */

import { useCallback, useMemo } from 'react';
import { usePermission } from './usePermission';
import {
  AUTO_PERMISSION_MAPPINGS,
  type BackendModule,
} from '../utils/permission-auto-generator';
import type { MenuItem } from '../mock/sidebar';

export const useMenuPermissions = () => {
${hookDeclarations}

  const permissions = useMemo(() => ({
${permissionsObject}
  }), [
${dependencyArray}
  ]);

  const hasPermission = useCallback(
    (menuId: string): boolean => {
      const requiredModule = AUTO_PERMISSION_MAPPINGS[menuId];
      
      if (!requiredModule) {
        return true;
      }
      
      const modulePermission = permissions[requiredModule as keyof typeof permissions];
      return (
        modulePermission?.isRead ||
        modulePermission?.isCreate ||
        modulePermission?.isUpdate ||
        modulePermission?.isDelete ||
        false
      );
    },
    [permissions]
  );

  const filterMenuItems = useCallback(
    (items: MenuItem[]): MenuItem[] => {
      return items
        .map(item => {
          if (item.children && item.children.length > 0) {
            const filteredChildren = filterMenuItems(item.children);
            
            if (filteredChildren.length > 0) {
              return { ...item, children: filteredChildren };
            }
            return null;
          }
          
          return hasPermission(item.id) ? item : null;
        })
        .filter((item): item is MenuItem => item !== null);
    },
    [hasPermission]
  );

  const isLoading = useMemo(() => {
    return Object.values(permissions).some(p => p?.isLoading);
  }, [permissions]);

  return {
    hasPermission,
    filterMenuItems,
    isLoading,
  };
};`;
}

const hookCode = generateHookCode();
const outputPath = path.join(__dirname, '../src/hooks/useMenuPermissions.ts');

fs.writeFileSync(outputPath, hookCode);

console.log('✅ Generated useMenuPermissions hook successfully!');
console.log(`📁 File: ${outputPath}`);
console.log('🎉 You can now use the auto-generated permission system!');
