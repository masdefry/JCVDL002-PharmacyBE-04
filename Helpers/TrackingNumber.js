const trackingNumber = (pr = "UB775", su = "HK") => {
    for (let i = 0; i < 5; i++) pr += ~~(Math.random() * 10);
    return pr + su;
};

module.exports = trackingNumber;