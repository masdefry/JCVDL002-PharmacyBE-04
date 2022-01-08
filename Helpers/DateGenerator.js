const dateGenerator = () => {
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

    let date = new Date();
    let year = date.getFullYear();
    let month = months[date.getMonth()];
    let days = date.getDate();
    let hour = date.getHours();
    let min = date.getMinutes();

    return (`${days} ${month} ${year}, ${hour}:${min} WIB`);
};

module.exports = dateGenerator;