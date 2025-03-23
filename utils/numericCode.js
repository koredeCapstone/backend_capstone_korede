function numericCodeGeneration(){
    const numericCodeGeneration = Math.floor(100000 + Math.random() * 900000).toString().padStart(6, '0');
    return numericCodeGeneration;
}

module.exports = numericCodeGeneration;