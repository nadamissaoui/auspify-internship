const MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

function drawMonthlyChart(canvas, monthlyData) {
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;
  const padding = { top: 20, right: 16, bottom: 34, left: 48 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  ctx.clearRect(0, 0, width, height);

  const monthsMap = {};
  monthlyData.forEach((entry) => {
    const key = `${entry._id.year}-${entry._id.month}`;
    if (!monthsMap[key]) monthsMap[key] = { income: 0, expense: 0, label: `${MONTHS[entry._id.month - 1]} ${entry._id.year}` };
    monthsMap[key][entry._id.type] = entry.total;
  });

  const points = Object.values(monthsMap).slice(-6);
  if (!points.length) {
    ctx.fillStyle = "#93a1bd";
    ctx.font = "14px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Aucune donnée pour le moment", width / 2, height / 2);
    return;
  }

  const maxValue = Math.max(...points.flatMap((p) => [p.income, p.expense]), 1);
  const stepY = chartH / 4;

  // Grid + Y labels
  ctx.strokeStyle = "rgba(148,163,184,0.12)";
  ctx.fillStyle = "#93a1bd";
  ctx.font = "11px Inter, sans-serif";
  ctx.textAlign = "right";
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + chartH - i * stepY;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
    ctx.fillText(Math.round((maxValue / 4) * i).toString(), padding.left - 8, y + 4);
  }

  const groupW = chartW / points.length;
  const barW = Math.min(26, groupW / 3);

  points.forEach((point, index) => {
    const centerX = padding.left + groupW * index + groupW / 2;

    const drawBar = (value, offset, color) => {
      const barH = (value / maxValue) * chartH;
      const x = centerX + offset - barW / 2;
      const y = padding.top + chartH - barH;
      const gradient = ctx.createLinearGradient(0, y, 0, padding.top + chartH);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, color + "33");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      const radius = 5;
      ctx.roundRect
        ? ctx.roundRect(x, y, barW, barH, [radius, radius, 0, 0])
        : ctx.rect(x, y, barW, barH);
      ctx.fill();
    };

    if (point.income) drawBar(point.income, -barW / 1.6, "#22c55e");
    if (point.expense) drawBar(point.expense, barW / 1.6, "#f43f5e");

    ctx.fillStyle = "#93a1bd";
    ctx.textAlign = "center";
    ctx.font = "11px Inter, sans-serif";
    ctx.fillText(point.label.split(" ")[0], centerX, height - 12);
  });

  // Legend
  ctx.textAlign = "left";
  ctx.fillStyle = "#22c55e";
  ctx.fillRect(padding.left, 4, 10, 10);
  ctx.fillStyle = "#93a1bd";
  ctx.fillText("Revenus", padding.left + 16, 13);
  ctx.fillStyle = "#f43f5e";
  ctx.fillRect(padding.left + 90, 4, 10, 10);
  ctx.fillStyle = "#93a1bd";
  ctx.fillText("Dépenses", padding.left + 106, 13);
}

window.drawMonthlyChart = drawMonthlyChart;
