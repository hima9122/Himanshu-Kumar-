/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateBatteryStatus } from './battery';

test('evaluateBatteryStatus marks charging devices as safe', () => {
  const result = evaluateBatteryStatus(10, true);
  assert.equal(result.alert, false);
  assert.equal(result.severity, 'charging');
  assert.equal(result.soundAlarm, false);
});

test('evaluateBatteryStatus triggers critical alert at or below 15%', () => {
  const result10 = evaluateBatteryStatus(10, false);
  assert.equal(result10.alert, true);
  assert.equal(result10.severity, 'critical');
  assert.equal(result10.soundAlarm, true);

  const result15 = evaluateBatteryStatus(15, false);
  assert.equal(result15.alert, true);
  assert.equal(result15.severity, 'critical');
  assert.equal(result15.soundAlarm, true);
});

test('evaluateBatteryStatus triggers low warning between 16% and 25%', () => {
  const result20 = evaluateBatteryStatus(20, false);
  assert.equal(result20.alert, true);
  assert.equal(result20.severity, 'low');
  assert.equal(result20.soundAlarm, false);

  const result25 = evaluateBatteryStatus(25, false);
  assert.equal(result25.alert, true);
  assert.equal(result25.severity, 'low');
});

test('evaluateBatteryStatus normal when above 25%', () => {
  const result50 = evaluateBatteryStatus(50, false);
  assert.equal(result50.alert, false);
  assert.equal(result50.severity, 'normal');
});
