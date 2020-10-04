export interface Tee {
  id?: number;
  cr?: number;
  sr?: number;
  tee?: string;
  teeType?: number;
}

export const teeTypes = {
  TEE_TYPE_18: 0,
  TEE_TYPE_FIRST_9: 1,
  TEE_TYPE_LAST_9: 2
};
