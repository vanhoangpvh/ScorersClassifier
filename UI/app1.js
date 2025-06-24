/* app1.js */
Dropzone.autoDiscover = false;

/* đổi tên có khoảng trắng thành _ để làm id hợp lệ */
function slugify(str) {
    return str.trim().replace(/\s+/g, "_");
}

function classifyFile(file) {
    let url = "http://127.0.0.1:5000";

    $("#submitBtn").addClass("pointer-events-none opacity-50");
    $("#classifyText").text("Classifying...");
    $("#loadingSpinner").removeClass("hidden");

    $.post(url, { image_data: file.dataURL })
        .done(function (data) {
            $("#submitBtn").removeClass("pointer-events-none opacity-50");
            $("#classifyText").text("Classify Image");
            $("#loadingSpinner").addClass("hidden");

            if (!data || data.length === 0) {
                $("#resultHolder, #divClassTable").addClass("hidden");
                $("#error").removeClass("hidden");
                return;
            }

            const match = data[0];
            const name  = match.Info.name;
            const slug  = slugify(name);

            $("#error").addClass("hidden");
            $("#resultHolder, #divClassTable").removeClass("hidden");
            /* Ẩn mọi thẻ player, hiện mỗi player khớp */
            $("#resultHolder [data-player]").addClass("hidden");
            $(`[data-player="${name}"]`).removeClass("hidden");

            /* Điền thông tin */
            $(`#shirt_${slug}`).text(match.Info.shirt_number);
            $(`#goals_${slug}`).text(match.Info.goals);

            /* Điền bảng xác suất */
            const dict = match.Class_dictionary;
            for (const person in dict) {
                const idx   = dict[person];
                const prob  = match.Probability[idx].toFixed(2);
                const slugP = slugify(person);
                $(`#score_${slugP}`).text(prob + "%");
            }
        })
        .fail(function () {
            $("#submitBtn").removeClass("pointer-events-none opacity-50");
            $("#classifyText").text("Classify Image");
            $("#loadingSpinner").addClass("hidden");
            $("#error").removeClass("hidden");
        });
}

function init() {
    const dz = new Dropzone("#dropzone", {
        url: "javascript:void(0)",   // không để Dropzone tự upload
        maxFiles: 1,
        addRemoveLinks: true,
        dictRemoveFile: "Remove",
        autoProcessQueue: false,
        acceptedFiles: "image/*"
    });

    /* Mỗi lần thêm file mới thì reset giao diện */
    dz.on("addedfile", () => {
        if (dz.files[1]) dz.removeFile(dz.files[0]);
        $("#error, #resultHolder, #divClassTable").addClass("hidden");
    });

    /* Bấm nút "Classify Image" */
    $("#submitBtn").on("click", () => {
        if (dz.files.length) classifyFile(dz.files[0]);
    });
}

$(document).ready(() => {
    $("#error, #resultHolder, #divClassTable").addClass("hidden");
    init();
});
