import { getAuthType as getAuthTypeFn, resetAuth as resetAuthFn, isAuthValid as isAuthValidFn } from './auth.ts';
import { getConfig as getConfigFn } from './config.ts';

// @ts-ignore
require(getAuthTypeFn());

// @ts-ignore
require(resetAuthFn());

// @ts-ignore
require(isAuthValidFn());

// @ts-ignore
require(getConfigFn());
