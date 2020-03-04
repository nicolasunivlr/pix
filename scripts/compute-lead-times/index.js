const { computeLeadTimes } = require('./compute-lead-times');
const { getRefNames, getTagDate, getCommitDatesBetweenTags } = require('./get-git-dates');
const axios = require('axios');
const stats = require('stats-lite');
const _ = require('lodash');

async function main() {
  const refNames = await getRefNames();

  // noinspection FunctionWithMultipleReturnPointsJS
  const leadTimesPromises = refNames.map(async (tag, index) => {
    const olderTag = refNames[index + 1];
    if (!olderTag) return [];

    const tagDateString = await getTagDate(tag);
    const commitDateStrings = await getCommitDatesBetweenTags(olderTag, tag);
    const leadTimes = computeLeadTimes(tagDateString, commitDateStrings);
    leadTimes.forEach((leadTime) => leadTime.tagName = tag);
    return leadTimes;
  });
  const leadTimes = await Promise.all(leadTimesPromises);
  const leadTimesJS = leadTimes.flat(1);
  const groupedLeadTimesPerVersion = _.groupBy(leadTimesJS, 'tagName');
  const leadTimesPerVersion = Object.keys(groupedLeadTimesPerVersion).map((version) => {
    const rawData = groupedLeadTimesPerVersion[version].map(({ leadTime }) => leadTime);
    console.log(rawData);
    return { version, stats: computeStats(rawData) };
  });
  return sendData(leadTimesPerVersion);
}

async function sendData(leadTimes) {
  return axios.post('https://hooks.zapier.com/hooks/catch/6863570/ompo5j7/', leadTimes);
}

function computeStats(rawData) {
  return {
    min: Math.min(...rawData),
    max: Math.max(...rawData),
    median: stats.median(rawData),
    mean: stats.mean(rawData),
    firstQuartile: stats.percentile(rawData, 0.25),
    thirdQuartile: stats.percentile(rawData, 0.75),
  };
}
main();
