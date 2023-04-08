/**
 * @param objArray An array of objects whose json string equivalents will be compared
 * @returns True if all objects are part of majority, false if there is no majority,
 * or a set of all the indexes which are in the majority.
 */
export function findMajority(objArray: any[]): boolean | Set<number> {
    // Compare all objects
    const matches = [false, false, false];
    const map = new Map<string, number[]>();
    objArray.forEach((obj, index) => {
        const key = JSON.stringify(obj);
        if(!map.has(key)){
            map.set(key, [index]);
        }
        else {
            map.get(key).push(index);
        }
    });
    const allAreSame = (map.size) === 1;
    if(allAreSame) return true;
    let majorityKey;
    const majority = objArray.length / 2;
    for(const key of map.keys()){
        if(map.get(key).length > majority){ 
            majorityKey = key;
        } 
    } 
    if(majorityKey === undefined) return false;
    return new Set<number>(map.get(majorityKey));
  }