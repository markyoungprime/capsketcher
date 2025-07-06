const canvas = document.getElementById('sketchCanvas');
const ctx = canvas.getContext('2d');

const PADDING_LEFT = 50;
const PADDING_RIGHT = 130;
const PADDING_TOP = 90;
const PADDING_BOTTOM = 100;

let coverLength = 32;
let coverWidth = 32;
let holes = [];
let sketchTitle = '';
let turnDown = 2.5;
let dripEdge = true;

const numHolesSelect = document.getElementById('numHoles');
const hole2Section = document.getElementById('hole2Section');
const hole1Centered = document.getElementById('hole1Centered');
const hole2Centered = document.getElementById('hole2Centered');
const hole1OffsetFields = document.getElementById('hole1OffsetFields');
const hole2OffsetFields = document.getElementById('hole2OffsetFields');
const downloadButton = document.getElementById('download');

numHolesSelect.onchange = () => {
  hole2Section.style.display = numHolesSelect.value === '2' ? 'block' : 'none';
};

hole1Centered.onchange = () => {
  hole1OffsetFields.style.display = hole1Centered.checked ? 'none' : 'block';
};

hole2Centered.onchange = () => {
  hole2OffsetFields.style.display = hole2Centered.checked ? 'none' : 'block';
};

document.getElementById('createSketch').onclick = () => {
  sketchTitle = document.getElementById('title').value.trim();
  if (sketchTitle === '') {
    alert('Please enter a Job Name.');
    return;
  }

  coverLength = parseFloat(document.getElementById('length').value);
  coverWidth = parseFloat(document.getElementById('width').value);
  turnDown = parseFloat(document.getElementById('turndown').value);
  dripEdge = document.getElementById('dripEdge').checked;

  if (isNaN(coverLength) || coverLength <= 0 || isNaN(coverWidth) || coverWidth <= 0) {
    alert('Length and Width must be positive numbers.');
    return;
  }
  if (isNaN(turnDown) || turnDown <= 0) {
    alert('Turn-down must be a positive number.');
    return;
  }

  holes = [];

  const numHoles = parseInt(numHolesSelect.value);

  for (let i = 1; i <= numHoles; i++) {
    const diameter = parseFloat(document.getElementById(`hole${i}Diameter`).value);
    const collar = parseFloat(document.getElementById(`hole${i}Collar`).value);
    if (isNaN(diameter) || diameter <= 0) {
      alert(`Hole ${i} diameter must be a positive number.`);
      return;
    }
    if (isNaN(collar) || collar <= 0) {
      alert(`Hole ${i} collar height must be a positive number.`);
      return;
    }

    const isCentered = document.getElementById(`hole${i}Centered`).checked;

    let xDir, xOffset, yDir, yOffset;
    if (!isCentered) {
      xDir = document.getElementById(`hole${i}XDir`).value;
      yDir = document.getElementById(`hole${i}YDir`).value;
      xOffset = parseFloat(document.getElementById(`hole${i}XOffset`).value);
      yOffset = parseFloat(document.getElementById(`hole${i}YOffset`).value);

      if (isNaN(xOffset) || xOffset < 0 || isNaN(yOffset) || yOffset < 0) {
        alert(`Offsets for Hole ${i} must be zero or positive.`);
        return;
      }
    }

    holes.push(getHoleData(diameter, collar, isCentered, xDir, xOffset, yDir, yOffset));
  }

  draw();
  downloadButton.disabled = false;
};

downloadButton.onclick = () => {
  if (downloadButton.disabled) {
    alert('Create a sketch first.');
    return;
  }
  const safeTitle = sketchTitle.replace(/\s+/g, '_').toLowerCase();
  const link = document.createElement('a');
  link.download = `${safeTitle}-chimney_sketch.png`;
  link.href = canvas.toDataURL();
  link.click();
};

function getHoleData(diameter, collar, isCentered, xDir, xOffset, yDir, yOffset) {
  let centerX, centerY;

  if (isCentered) {
    centerX = coverWidth / 2;
    centerY = coverLength / 2;
  } else {
    centerX = xDir === 'From Left' ? xOffset + diameter / 2 : coverWidth - xOffset - diameter / 2;
    centerY = yDir === 'From Front' ? yOffset + diameter / 2 : coverLength - yOffset - diameter / 2;
  }

  return { centerX, centerY, diameter, collar, isCentered, xDir, xOffset, yDir, yOffset };
}

function drawArrowLine(x1, y1, x2, y2, color) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  const headlen = 10;
  const angle = Math.atan2(y2 - y1, x2 - x1);

  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headlen * Math.cos(angle - Math.PI / 6), y2 - headlen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x2 - headlen * Math.cos(angle + Math.PI / 6), y2 - headlen * Math.sin(angle + Math.PI / 6));
  ctx.lineTo(x2, y2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x1 + headlen * Math.cos(angle - Math.PI / 6), y1 + headlen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x1 + headlen * Math.cos(angle + Math.PI / 6), y1 + headlen * Math.sin(angle + Math.PI / 6));
  ctx.lineTo(x1, y1);
  ctx.fill();
}

function draw() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientWidth * 1.5;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const scaleX = (canvas.width - PADDING_LEFT - PADDING_RIGHT) / coverWidth;
  const scaleY = (canvas.height - PADDING_TOP - PADDING_BOTTOM) / coverLength;
  const scale = Math.min(scaleX, scaleY);

  const offsetX = PADDING_LEFT;
  const offsetY = PADDING_TOP;

  ctx.fillStyle = '#000';
  ctx.font = 'bold 20px Arial';
  ctx.fillText(`Job: ${sketchTitle}`, canvas.width / 2 - ctx.measureText(`Job: ${sketchTitle}`).width / 2, 30);

  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.strokeRect(offsetX, offsetY, coverWidth * scale, coverLength * scale);

  ctx.fillStyle = '#000';
  ctx.font = '12px Arial';
  ctx.fillText('Left', offsetX - 40, offsetY + (coverLength * scale) / 2);
  ctx.fillText('Right', offsetX + coverWidth * scale + 10, offsetY + (coverLength * scale) / 2);
  ctx.fillText('Back', offsetX + (coverWidth * scale) / 2 - 15, offsetY - 10);
  ctx.fillText('Front (cricket/high side)', offsetX + (coverWidth * scale) / 2 - 60, offsetY + coverLength * scale + 40);

  drawArrowLine(
    offsetX,
    offsetY + coverLength * scale + 50,
    offsetX + coverWidth * scale,
    offsetY + coverLength * scale + 50,
    'red'
  );
  ctx.fillStyle = 'red';
  ctx.fillText(`Width: ${coverWidth} in`, offsetX + (coverWidth * scale) / 2 - 20, offsetY + coverLength * scale + 65);

  drawArrowLine(
    offsetX + coverWidth * scale + 50,
    offsetY,
    offsetX + coverWidth * scale + 50,
    offsetY + coverLength * scale,
    'red'
  );
  ctx.fillText(`Length: ${coverLength} in`, offsetX + coverWidth * scale + 55, offsetY + (coverLength * scale) / 2);

  ctx.fillStyle = 'blue';
  ctx.font = '12px Arial';
  const dripNote = dripEdge ? 'w/ Drip-edge' : 'NO Drip-edge';
  ctx.fillText(
    `Turn-down: ${turnDown}" ${dripNote}`,
    offsetX + 5,
    offsetY + coverLength * scale - 5
  );

  holes.forEach(hole => {
    const x = offsetX + hole.centerX * scale;
    const y = offsetY + (coverLength - hole.centerY) * scale;

    ctx.beginPath();
    ctx.arc(x, y, (hole.diameter / 2) * scale, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = '10px Arial';
    ctx.fillStyle = 'red';
    ctx.fillText(`Ø ${hole.diameter}" x ${hole.collar}" collar`, x + 5, y - 5);

    if (!hole.isCentered) {
      ctx.fillStyle = 'blue';
      ctx.fillText(`${hole.xDir}: ${hole.xOffset}"`, x + 10, y + 10);
      ctx.fillText(`${hole.yDir}: ${hole.yOffset}"`, x + 10, y + 20);
    }
  });
}

